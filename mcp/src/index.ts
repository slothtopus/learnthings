#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

import { routeCoreLogsToStderr } from "./log.js";

// core's diagnostics must not reach stdout, which the stdio transport reserves
// for JSON-RPC frames. Set before anything triggers core logging.
routeCoreLogsToStderr();

// Load the package's .env before any module reads config. Real environment
// variables take precedence over the file, so a launcher's env block still
// wins. The path is resolved from this file, not the cwd, which the MCP client
// controls and which the server later changes to the data directory.
const envFile = fileURLToPath(new URL("../.env", import.meta.url));
if (existsSync(envFile)) {
  try {
    process.loadEnvFile(envFile);
  } catch (err) {
    process.stderr.write(`[learnthings-mcp] could not read .env: ${(err as Error).message}\n`);
  }
}

// Dynamic import so all of the above runs before core's module side effects.
const { startServer } = await import("./server.js");

await startServer().catch((err: unknown) => {
  process.stderr.write(`[learnthings-mcp] fatal: ${(err as Error).stack ?? err}\n`);
  process.exit(1);
});
