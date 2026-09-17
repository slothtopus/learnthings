import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { auth } from "../auth.js";
import { config } from "../config.js";
import { syncDecks, listLoadedDecks, hasSynced, type DeckSummary } from "../registry.js";
import { text, failure } from "./result.js";

const table = (decks: DeckSummary[]) => {
  if (decks.length === 0) return ["(no decks)"];
  const width = Math.max(...decks.map((d) => d.name.length), 4);
  return [
    `${"Deck".padEnd(width)}  ${"Types".padStart(5)}  ${"Notes".padStart(6)}  ` +
      `${"Cards".padStart(6)}  Id`,
    ...decks.map(
      (d) =>
        `${d.name.padEnd(width)}  ${String(d.noteTypes).padStart(5)}  ` +
        `${String(d.notes).padStart(6)}  ${String(d.cards).padStart(6)}  ${d.id}`,
    ),
  ];
};

const problems = (failed: { deckId: string; error: string }[]) =>
  failed.length === 0
    ? []
    : ["", `${failed.length} deck(s) failed:`, ...failed.map((f) => `  ${f.deckId}: ${f.error}`)];

export const registerDeckTools = (server: McpServer) => {
  server.registerTool(
    "sync_decks",
    {
      title: "Sync decks from the server",
      description:
        "Reconcile the signed-in user's decks between the remote CouchDB and a local " +
        "PouchDB copy, then load them. Decks found only on the server are created " +
        "locally, decks found only locally are created on the server, and both are then " +
        "replicated. By default this is a single pass that leaves nothing running: run " +
        "it again to push later work back up and pick up changes made elsewhere.",
      inputSchema: {
        live: z
          .boolean()
          .optional()
          .describe(
            "Keep continuous replication running for the life of the server instead of " +
              "doing a single pass. Defaults to false.",
          ),
      },
      annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: true },
    },
    async ({ live }) => {
      if (!auth.signedIn) {
        return failure("Not signed in. Use the `login` tool first.");
      }

      try {
        const mode = live ? "live" : "once";
        const result = await syncDecks(mode);

        const lines = [
          `Synced ${result.decks.length} of ${result.deckIds.length} deck(s) ` +
            `for ${auth.email ?? result.couchId}.`,
          `Mode:       ${
            mode === "live"
              ? "live — replication stays running until the server stops"
              : "one-shot — nothing left running"
          }`,
          `Local copy: ${config.dataDir}`,
        ];

        if (!result.remoteReachable) {
          lines.push(
            "",
            "WARNING: the server could not be reached. These are local decks only, " +
              "and nothing was replicated.",
          );
        }

        lines.push("", ...table(result.decks), ...problems(result.failed));

        if (mode === "once" && result.remoteReachable && result.decks.length > 0) {
          lines.push("", "Run `sync_decks` again to sync later changes with the server.");
        }
        return text(...lines);
      } catch (err) {
        return failure(`Sync failed: ${(err as Error).message}`);
      }
    },
  );

  server.registerTool(
    "list_decks",
    {
      title: "List locally synced decks",
      description:
        "List the decks currently loaded in the local database, with note and card " +
        "counts. Reads local state only — run `sync_decks` first to populate it.",
      inputSchema: {},
      annotations: { readOnlyHint: true },
    },
    async () => {
      if (!hasSynced()) {
        return text(
          "No decks loaded yet.",
          "",
          auth.signedIn
            ? "Run `sync_decks` to pull them from the server."
            : "Sign in with `login`, then run `sync_decks`.",
        );
      }
      const decks = listLoadedDecks();
      return text(`${decks.length} deck(s) loaded locally.`, "", ...table(decks));
    },
  );
};
