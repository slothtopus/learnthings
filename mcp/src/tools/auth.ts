import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { auth } from "../auth.js";
import { config } from "../config.js";
import { log } from "../log.js";
import { text, failure } from "./result.js";

export const registerAuthTools = (server: McpServer) => {
  server.registerTool(
    "login",
    {
      title: "Sign in to learnthings",
      description:
        "Authenticate against the learnthings backend with a Firebase email and password. " +
        "Omit both arguments to use the LEARNTHINGS_EMAIL / LEARNTHINGS_PASSWORD environment " +
        "variables. The session is cached locally, so this is normally only needed once.",
      inputSchema: {
        email: z.string().email().optional().describe("Account email address"),
        password: z.string().optional().describe("Account password"),
      },
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async ({ email, password }) => {
      const user = email ?? config.email;
      const pass = password ?? config.password;

      if (!user || !pass) {
        return failure(
          "No credentials supplied. Pass email and password, or set LEARNTHINGS_EMAIL " +
            "and LEARNTHINGS_PASSWORD in the server environment.",
        );
      }

      try {
        const couchId = await auth.signIn(user, pass);
        return text(
          `Signed in as ${auth.email ?? user}.`,
          `CouchDB identity: ${couchId}`,
          `Backend: ${config.couchHost}`,
          "",
          "Run `sync_decks` to pull your decks into the local database.",
        );
      } catch (err) {
        return failure((err as Error).message);
      }
    },
  );

  server.registerTool(
    "login_with_google",
    {
      title: "Sign in to learnthings with Google",
      description:
        "Authenticate with a Google account. Opens the Google consent screen in the " +
        "default browser and waits for you to finish, then exchanges the result for a " +
        "learnthings session. Use this for accounts created via Google sign-in, which " +
        "have no password. Against the local auth emulator no browser is used — pass " +
        "the email of the Google identity to simulate.",
      inputSchema: {
        email: z
          .string()
          .email()
          .optional()
          .describe(
            "Emulator only: the Google identity to sign in as. Ignored against real Google, " +
              "where the account is chosen in the browser.",
          ),
      },
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async ({ email }) => {
      let promptUrl: string | undefined;
      try {
        const couchId = await auth.signInWithGoogle({
          email,
          onPrompt: (url) => {
            promptUrl = url;
            log(`waiting for Google sign-in: ${url}`);
          },
        });
        const lines = [
          `Signed in as ${auth.email ?? "unknown"} via ${auth.provider ?? "google.com"}.`,
          `CouchDB identity: ${couchId}`,
          `Backend: ${config.couchHost}`,
        ];
        if (config.usingEmulator) {
          lines.push(
            "",
            "NOTE: this is a simulated Google identity from the local auth emulator, " +
              "not a real Google account. Turn the emulator off to sign in for real.",
          );
        }
        lines.push("", "Run `sync_decks` to pull your decks into the local database.");
        return text(...lines);
      } catch (err) {
        const lines = [(err as Error).message];
        if (promptUrl) {
          lines.push(
            "",
            "If the browser did not open, visit this URL and try again:",
            promptUrl,
          );
        }
        return failure(lines.join("\n"));
      }
    },
  );

  server.registerTool(
    "auth_status",
    {
      title: "Show sign-in status",
      description:
        "Report whether the server is signed in, as whom, and which backend and local " +
        "data directory are in use.",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => {
      const lines = [
        `Backend:    ${config.couchHost}${config.usingEmulator ? " (auth emulator)" : ""}`,
        `Data dir:   ${config.dataDir}`,
      ];

      if (!auth.signedIn) {
        lines.unshift("Status:     signed out");
        lines.push(
          "",
          "Sign in with `login` (email + password) or `login_with_google`.",
        );
        return text(...lines);
      }

      const minutes = Math.max(0, Math.round((auth.expiresAtMs - Date.now()) / 60_000));
      lines.unshift(
        "Status:     signed in",
        `Account:    ${auth.email ?? "unknown"}`,
        `Provider:   ${auth.provider ?? "unknown"}`,
        `CouchDB id: ${auth.couchId}`,
      );
      lines.push(`Token:      valid for ~${minutes} min (auto-refreshed)`);
      return text(...lines);
    },
  );

  server.registerTool(
    "logout",
    {
      title: "Sign out",
      description: "Clear the current session and delete the cached credentials on disk.",
      inputSchema: {},
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async () => {
      await auth.signOut();
      return text("Signed out. Cached credentials removed.");
    },
  );
};
