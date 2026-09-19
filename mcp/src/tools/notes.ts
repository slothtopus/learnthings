import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { describeDeck, createNote, type NoteTypeSchema } from "../notes.js";
import { text, failure } from "./result.js";

const renderNoteType = (nt: NoteTypeSchema) => {
  const lines = [`NOTE TYPE  ${nt.name}   id: ${nt.id}   (${nt.noteCount} notes)`];
  if (nt.description) lines.push(`  ${nt.description}`);

  lines.push("  fields:");
  for (const f of nt.fields) {
    const flag = f.writable ? "" : `  [read-only: ${f.readOnlyReason}]`;
    lines.push(`    {{${f.slug}}}  "${f.name}"  ${f.kind}${flag}`);
    if (f.description) lines.push(`        ${f.description}`);
  }

  if (nt.templates.length > 0) {
    lines.push("  card templates:");
    for (const t of nt.templates) {
      const uses = t.usesFields.length > 0 ? t.usesFields.join(", ") : "(none)";
      lines.push(`    ${t.name}  shows: ${uses}`);
    }
  }
  return lines;
};

export const registerNoteTools = (server: McpServer) => {
  server.registerTool(
    "describe_deck",
    {
      title: "Describe a deck's note types and fields",
      description:
        "Show the structure of a synced deck: its note types, the fields on each (with " +
        "the name card templates use for them, and what each field is for), and which " +
        "fields each card template displays. Read this before creating notes, so values " +
        "go in the right fields.",
      inputSchema: {
        deck_id: z.string().describe("Deck id, as shown by list_decks."),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ deck_id }) => {
      try {
        const deck = describeDeck(deck_id);
        const lines = [`DECK  ${deck.name}   id: ${deck.id}`];
        if (deck.description) lines.push(`  ${deck.description}`);
        if (deck.noteTypes.length === 0) {
          lines.push("", "This deck has no note types yet.");
        }
        for (const nt of deck.noteTypes) lines.push("", ...renderNoteType(nt));
        return text(...lines);
      } catch (err) {
        return failure((err as Error).message);
      }
    },
  );

  server.registerTool(
    "create_note",
    {
      title: "Create a note in a deck",
      description:
        "Add a note to a note type, filling its text fields. Cards are created " +
        "automatically from the note type's card templates. Call describe_deck first to " +
        "learn the field names and what each one holds. Keys are the template names " +
        "shown by describe_deck — the {{slug}} form, not the display name. " +
        "The note is saved locally — run sync_decks to send it to the server.",
      inputSchema: {
        deck_id: z.string().describe("Deck id, as shown by list_decks."),
        note_type_id: z.string().describe("Note type id, as shown by describe_deck."),
        fields: z
          .record(z.string(), z.string())
          .describe(
            'Field values keyed by the field\'s template name, e.g. ' +
              '{"front": "aterrar", "back": "to land"}. ' +
              "Only text fields can be set; omit any field you have no value for.",
          ),
      },
      annotations: { readOnlyHint: false, idempotentHint: false },
    },
    async ({ deck_id, note_type_id, fields }) => {
      try {
        const r = await createNote(deck_id, note_type_id, fields);
        return text(
          `Created a note in "${r.noteTypeName}".`,
          `Note id: ${r.noteId}`,
          `Cards created: ${r.cardsCreated}`,
          "",
          "Set:",
          ...r.set.map((f) => `  ${f.slug}  ("${f.name}")`),
          "",
          "Saved locally. Run `sync_decks` to send it to the server.",
        );
      } catch (err) {
        return failure((err as Error).message);
      }
    },
  );
};
