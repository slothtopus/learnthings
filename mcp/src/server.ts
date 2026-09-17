import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { config } from "./config.js";
import { auth } from "./auth.js";
import { log } from "./log.js";
import { registerAuthTools } from "./tools/auth.js";
import { registerDeckTools } from "./tools/decks.js";

export const startServer = async () => {
  const server = new McpServer({ name: "learnthings", version: "0.1.0" });

  registerAuthTools(server);
  registerDeckTools(server);

  // Try to come up already authenticated; never fatal.
  const restored = await auth.restore();
  log(
    restored
      ? `ready — signed in as ${auth.email ?? auth.couchId}`
      : "ready — signed out (use the login tool)",
  );
  log(`backend: ${config.couchHost}${config.usingEmulator ? " (auth emulator)" : ""}`);
  log(
    `google sign-in: ${
      config.usingEmulator
        ? "emulator (no OAuth client needed)"
        : config.googleClientId
          ? `configured (${config.googleClientId.slice(0, 12)}...)`
          : "not configured — set LEARNTHINGS_GOOGLE_CLIENT_ID"
    }`,
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
};
