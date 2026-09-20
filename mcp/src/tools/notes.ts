import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  describeDeck,
  createNote,
  editNote,
  addField,
  deleteField,
  findNotes,
  viewNote,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  type NoteTypeSchema,
  type FieldDeletionImpact,
  type SearchResult,
} from "../notes.js";
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

const describeImpact = (impact: FieldDeletionImpact, noteTypeName: string) => {
  const lines = [
    `Deleting "${impact.name}" ({{${impact.slug}}}, ${impact.kind}) from "${noteTypeName}" would:`,
  ];

  lines.push(
    impact.notesWithContent > 0
      ? `  - delete its content from ${impact.notesWithContent} of ${impact.totalNotes} note(s)`
      : `  - delete no content: none of the ${impact.totalNotes} note(s) have a value in it`,
  );

  if (impact.templatesUsingField.length > 0) {
    lines.push(
      `  - leave ${impact.templatesUsingField.length} card template(s) rendering it ` +
        `blank: ${impact.templatesUsingField.join(", ")}`,
    );
  }
  if (impact.isLastField) {
    lines.push(
      `  - remove all ${impact.totalNotes} note(s) and their cards, since it is the ` +
        "last field and an empty note is not kept",
    );
  }
  return lines;
};

const renderResults = (r: SearchResult, what: string) => {
  if (r.total === 0) return [`No notes ${what} in "${r.deckName}".`];

  const last = r.offset + r.returned.length;
  const lines = [
    r.total === r.returned.length
      ? `${r.total} note(s) ${what} in "${r.deckName}".`
      : `${r.total} note(s) ${what} in "${r.deckName}" \u2014 showing ${r.offset + 1}\u2013${last}.`,
  ];

  for (const note of r.returned) {
    lines.push("", `${note.id}   [${note.noteTypeName}]`);
    for (const line of note.lines) lines.push(`    ${line.slug}: ${line.snippet}`);
  }

  if (last < r.total) lines.push("", `Pass offset: ${last} to see the next page.`);
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
  server.registerTool(
    "add_field",
    {
      title: "Add a field to a note type",
      description:
        "Add a text field to a note type. The field appears on every note of that " +
        "type, empty until filled in. Only text fields can be added: the other kinds " +
        "hold a file or generate their own content. To show the field on a card, its " +
        "template has to be edited to reference it, which this server cannot do yet. " +
        "Saved locally — run sync_decks to send it to the server.",
      inputSchema: {
        deck_id: z.string().describe("Deck id, as shown by list_decks."),
        note_type_id: z.string().describe("Note type id, as shown by describe_deck."),
        name: z.string().describe('Display name, e.g. "Example sentence".'),
        slug: z
          .string()
          .optional()
          .describe(
            "The name card templates will use, e.g. example_sentence. Derived from " +
              "the display name when omitted.",
          ),
        description: z
          .string()
          .optional()
          .describe(
            "What belongs in this field. Worth setting — it guides whoever fills it in.",
          ),
      },
      annotations: { readOnlyHint: false, idempotentHint: false },
    },
    async ({ deck_id, note_type_id, name, slug, description }) => {
      try {
        const r = await addField(deck_id, note_type_id, { name, slug, description });
        return text(
          `Added the field "${r.name}" to "${r.noteTypeName}".`,
          `Card templates reference it as {{${r.slug}}}.`,
          ...(r.description ? [`Description: ${r.description}`] : []),
          "",
          `It is now on all ${r.notesAffected} note(s) of this type, empty until filled in.`,
          "It will not appear on a card until a card template references it.",
          "",
          "Saved locally. Run `sync_decks` to send it to the server.",
        );
      } catch (err) {
        return failure((err as Error).message);
      }
    },
  );

  server.registerTool(
    "delete_field",
    {
      title: "Delete a field from a note type",
      description:
        "Remove a field from a note type, deleting its content from every note of " +
        "that type. Call without `confirm` first: nothing is deleted and the effect " +
        "is reported, so it can be checked before anything is lost. This cannot be " +
        "undone once synced.",
      inputSchema: {
        deck_id: z.string().describe("Deck id, as shown by list_decks."),
        note_type_id: z.string().describe("Note type id, as shown by describe_deck."),
        slug: z.string().describe("The field's template name, as shown by describe_deck."),
        confirm: z
          .boolean()
          .optional()
          .describe(
            "Omit or set false to report the effect without deleting anything. Set " +
              "true only once the user has seen that report and agreed.",
          ),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
    },
    async ({ deck_id, note_type_id, slug, confirm }) => {
      try {
        const r = await deleteField(deck_id, note_type_id, slug, confirm === true);
        const impact = describeImpact(r.impact, r.noteTypeName);

        if (!r.deleted) {
          return text(
            ...impact,
            "",
            "Nothing has been deleted. Re-run with confirm: true to go ahead.",
          );
        }
        return text(
          `Deleted the field "${r.impact.name}" ({{${r.impact.slug}}}) from "${r.noteTypeName}".`,
          ...(r.notesDeleted > 0
            ? [
                "",
                `It was the last field, so ${r.notesDeleted} note(s) had nothing left in ` +
                  "them and were removed too.",
              ]
            : []),
          ...(r.impact.templatesUsingField.length > 0
            ? [
                "",
                `These card templates still reference {{${r.impact.slug}}} and will now ` +
                  `render it blank: ${r.impact.templatesUsingField.join(", ")}.`,
              ]
            : []),
          "",
          "Saved locally. Run `sync_decks` to send the change to the server.",
        );
      } catch (err) {
        return failure((err as Error).message);
      }
    },
  );

  server.registerTool(
    "search_notes",
    {
      title: "Search notes in a deck",
      description:
        "Find notes whose text contains a phrase. Matching ignores case and covers " +
        "every text field, showing which field matched and the text around it. " +
        "Attachment fields hold no searchable text. Returns note ids — pass one to " +
        "get_note for the full content.",
      inputSchema: {
        deck_id: z.string().describe("Deck id, as shown by list_decks."),
        query: z.string().describe("Text to look for."),
        note_type_id: z
          .string()
          .optional()
          .describe("Restrict to one note type, as shown by describe_deck."),
        field: z.string().optional().describe("Restrict to one field, by its template name."),
        limit: z
          .number()
          .int()
          .optional()
          .describe(`How many notes to return. Default ${DEFAULT_LIMIT}, maximum ${MAX_LIMIT}.`),
        offset: z.number().int().optional().describe("Skip this many results, for paging."),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ deck_id, query, note_type_id, field, limit, offset }) => {
      try {
        const r = findNotes(deck_id, {
          query,
          noteTypeId: note_type_id,
          fieldSlug: field,
          limit,
          offset,
        });
        return text(...renderResults(r, `matching "${query}"`));
      } catch (err) {
        return failure((err as Error).message);
      }
    },
  );

  server.registerTool(
    "list_notes",
    {
      title: "List notes in a deck",
      description:
        "Browse a deck's notes without searching, previewing the first text fields of " +
        "each. Use search_notes to find particular content, and get_note for one note " +
        "in full.",
      inputSchema: {
        deck_id: z.string().describe("Deck id, as shown by list_decks."),
        note_type_id: z
          .string()
          .optional()
          .describe("Restrict to one note type, as shown by describe_deck."),
        limit: z
          .number()
          .int()
          .optional()
          .describe(`How many notes to return. Default ${DEFAULT_LIMIT}, maximum ${MAX_LIMIT}.`),
        offset: z.number().int().optional().describe("Skip this many notes, for paging."),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ deck_id, note_type_id, limit, offset }) => {
      try {
        const r = findNotes(deck_id, { noteTypeId: note_type_id, limit, offset });
        return text(...renderResults(r, "in total"));
      } catch (err) {
        return failure((err as Error).message);
      }
    },
  );

  server.registerTool(
    "get_note",
    {
      title: "Show a note's content",
      description:
        "Show every field of one note, with the cards it produces. Image and audio " +
        "fields are described rather than returned: their contents cannot be sent " +
        "over this connection.",
      inputSchema: {
        deck_id: z.string().describe("Deck id, as shown by list_decks."),
        note_id: z.string().describe("Note id, as shown by search_notes or list_notes."),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ deck_id, note_id }) => {
      try {
        const note = viewNote(deck_id, note_id);
        const width = Math.max(...note.fields.map((f) => f.slug.length), 4);
        const pad = " ".repeat(width);
        return text(
          `NOTE  ${note.id}   [${note.noteTypeName}]`,
          "",
          ...note.fields.flatMap((f) => {
            const [first = "", ...rest] = f.value.split("\n");
            const body = [`  ${f.slug.padEnd(width)}  ${first}`, ...rest.map((l) => `  ${pad}  ${l}`)];
            return f.truncated ? [...body, `  ${pad}  … (truncated)`] : body;
          }),
          "",
          note.cards.length > 0
            ? `Cards: ${note.cards
                .map((c) => c.template + (c.variant ? ` (${c.variant})` : ""))
                .join(", ")}`
            : "Cards: none",
        );
      } catch (err) {
        return failure((err as Error).message);
      }
    },
  );

  server.registerTool(
    "edit_note",
    {
      title: "Change a note's content",
      description:
        "Update text fields on an existing note. Only the fields you name are changed; " +
        "anything you leave out keeps its current value, so there is no need to resend " +
        "a whole note to change one field. This is also how a field added after the " +
        "note was written gets filled in. Passing an empty value clears a field. " +
        "Saved locally — run sync_decks to send the change to the server.",
      inputSchema: {
        deck_id: z.string().describe("Deck id, as shown by list_decks."),
        note_id: z.string().describe("Note id, as shown by search_notes or list_notes."),
        fields: z
          .record(z.string(), z.string())
          .describe(
            'Field values keyed by the field\'s template name, e.g. {"back": "to land"}. ' +
              "Only text fields can be set. An empty string clears the field.",
          ),
      },
      annotations: { readOnlyHint: false, idempotentHint: true },
    },
    async ({ deck_id, note_id, fields }) => {
      try {
        const r = await editNote(deck_id, note_id, fields);
        const changed = r.edits.filter((e) => e.action !== "unchanged");

        if (changed.length === 0) {
          return text(
            `Nothing changed on the note in "${r.noteTypeName}" — every field given ` +
              "already held that value.",
          );
        }
        return text(
          `Updated the note in "${r.noteTypeName}".`,
          `Note id: ${r.noteId}`,
          "",
          ...r.edits.map((e) => {
            const what =
              e.action === "set" ? "set" : e.action === "cleared" ? "cleared" : "unchanged";
            return `  ${e.slug}  ("${e.name}") — ${what}`;
          }),
          "",
          "Saved locally. Run `sync_decks` to send the change to the server.",
        );
      } catch (err) {
        return failure((err as Error).message);
      }
    },
  );

};
