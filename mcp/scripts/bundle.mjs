#!/usr/bin/env node
/**
 * Build a self-contained .mcpb bundle.
 *
 * The bundle has to stand on its own inside Claude Desktop, which rules out the
 * layout used in development: `core` is a file: dependency, so npm links it as a
 * symlink to ../../core, and core's own node_modules carries ~146MB of build and
 * test tooling. So we stage a fresh tree instead of copying the dev one:
 *
 *   - a package.json listing the runtime dependencies of BOTH packages, so npm
 *     installs them (production only) hoisted into one node_modules
 *   - core materialised as a real directory, not a link, holding only its build
 *   - the compiled server, and the manifest at the root where mcpb expects it
 */
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MCP = dirname(dirname(fileURLToPath(import.meta.url)));
const CORE = join(MCP, "..", "core");
const STAGE = join(MCP, "dist-bundle");
const OUT = join(MCP, "learnthings.mcpb");

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, stdio: "inherit", env: process.env });

const mcpPkg = readJson(join(MCP, "package.json"));
const corePkg = readJson(join(CORE, "package.json"));

if (!existsSync(join(MCP, "build", "index.js"))) {
  throw new Error("mcp/build is missing — run `npm run build` first");
}
if (!existsSync(join(CORE, "build", "Deck.js"))) {
  throw new Error("core/build is missing — run `npm run build` in ../core first");
}

console.log("staging bundle in", STAGE);
rmSync(STAGE, { recursive: true, force: true });
mkdirSync(STAGE, { recursive: true });

// `core` is installed by hand below, so drop the file: reference that would
// otherwise be re-linked; everything else both packages need at runtime stays.
const { core: _ignored, ...mcpDeps } = mcpPkg.dependencies;
writeFileSync(
  join(STAGE, "package.json"),
  JSON.stringify(
    {
      name: "learnthings-mcpb",
      version: mcpPkg.version,
      private: true,
      // The compiled server and core are both ESM with fully specified imports.
      type: "module",
      dependencies: { ...mcpDeps, ...corePkg.dependencies },
      ...(corePkg.overrides ? { overrides: corePkg.overrides } : {}),
    },
    null,
    2,
  ),
);

console.log("installing production dependencies...");
run("npm", ["install", "--omit=dev", "--no-audit", "--no-fund", "--silent"], STAGE);

// Materialise core as a real package. Its exports map ("./*": "./build/*") means
// `core/Deck.js` resolves to build/Deck.js, so only build/ and the manifest ship.
console.log("materialising core...");
const coreDest = join(STAGE, "node_modules", "core");
mkdirSync(coreDest, { recursive: true });
cpSync(join(CORE, "build"), join(coreDest, "build"), { recursive: true });
writeFileSync(
  join(coreDest, "package.json"),
  JSON.stringify({ ...corePkg, devDependencies: undefined, scripts: undefined }, null, 2),
);

cpSync(join(MCP, "build"), join(STAGE, "build"), { recursive: true });
cpSync(join(MCP, "manifest.json"), join(STAGE, "manifest.json"));

console.log("packing...");
rmSync(OUT, { force: true });
run("npx", ["--yes", "@anthropic-ai/mcpb@2.1.2", "pack", STAGE, OUT], MCP);
console.log("\nbundle written to", OUT);
