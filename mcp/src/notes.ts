import { Deck } from "core/Deck.js";
import type { NoteType } from "core/NoteType.js";
import type { AnyNoteField } from "core/fields/base.js";
import { GeneratedField } from "core/fields/base.js";
import { TextField } from "core/fields/fields.js";
import type { Note } from "core/Note.js";
import { searchNotes, noteTextFields, buildSnippet } from "core/search.js";

import { getLoadedDeck, hasSynced } from "./registry.js";

/**
 * Every field class declares its kind as its subtype — "text", "image",
 * "audio", "text_to_speech" — so there is no need to match on constructors.
 */
export type FieldKind = string;

/** The one kind whose content can be set as plain text. */
const TEXT_KIND = "text";

export type FieldSchema = {
  /** The name card templates reference, e.g. {{front}}. The key create_note takes. */
  slug: string;
  /** Human-facing label. */
  name: string;
  kind: FieldKind;
  description?: string;
  /** Whether create_note can currently set this field. */
  writable: boolean;
  /** Why not, when writable is false. */
  readOnlyReason?: string;
  mimetype?: string;
};

export type TemplateSchema = { name: string; variants: string[]; usesFields: string[] };

export type NoteTypeSchema = {
  id: string;
  name: string;
  description?: string;
  noteCount: number;
  fields: FieldSchema[];
  templates: TemplateSchema[];
};

export const kindOf = (field: AnyNoteField): FieldKind => field.subtype;

const describeField = (field: AnyNoteField): FieldSchema => {
  const kind = kindOf(field);
  const base = {
    slug: field.slug,
    name: field.name,
    kind,
    description: field.description,
    mimetype: (field.options as { mimetype?: string } | null)?.mimetype,
  };

  if (kind === TEXT_KIND) return { ...base, writable: true };
  if (field instanceof GeneratedField) {
    return {
      ...base,
      writable: false,
      readOnlyReason: "generated from another field, not set directly",
    };
  }
  return {
    ...base,
    writable: false,
    readOnlyReason: "holds a file, which cannot be supplied here yet",
  };
};

/**
 * Which field slugs a template actually renders. Handlebars references are
 * matched loosely and then intersected with the real field slugs, so block
 * helpers and unrelated identifiers drop out.
 */
export const fieldsUsedBy = (source: string, slugs: Set<string>) => {
  const found = new Set<string>();
  for (const [, ref] of source.matchAll(/\{\{\{?[#/]?\s*([A-Za-z_][A-Za-z0-9_]*)/g)) {
    if (ref && slugs.has(ref)) found.add(ref);
  }
  return [...found];
};

export const describeNoteType = (noteType: NoteType): NoteTypeSchema => {
  const fields = noteType.getAllFields();
  const slugs = new Set(fields.map((f) => f.slug));

  return {
    id: noteType.id,
    name: noteType.name,
    description: noteType.description,
    noteCount: noteType.getAllNotes().length,
    fields: fields.map(describeField),
    templates: noteType.getAllCardTemplates().map((t) => {
      const variants = t.getAllVariants();
      const source = variants.map((v) => `${v.front ?? ""}\n${v.back ?? ""}`).join("\n");
      return {
        name: t.name,
        variants: variants.map((v) => v.name),
        usesFields: fieldsUsedBy(source, slugs),
      };
    }),
  };
};

export const getDeckOrThrow = (deckId: string): Deck => {
  if (!hasSynced()) {
    throw new Error("No decks are loaded. Run `sync_decks` first.");
  }
  const deck = getLoadedDeck(deckId);
  if (deck === undefined) {
    throw new Error(`No loaded deck with id "${deckId}". Run \`list_decks\` to see them.`);
  }
  return deck;
};

export const describeDeck = (deckId: string) => {
  const deck = getDeckOrThrow(deckId);
  return {
    id: deck.id,
    name: deck.name,
    description: deck.description,
    noteTypes: deck.getAllNoteTypes().map(describeNoteType),
  };
};

export const getNoteTypeOrThrow = (deck: Deck, noteTypeId: string): NoteType => {
  const noteType = deck.getAllNoteTypes().find((n) => n.id === noteTypeId);
  if (noteType === undefined) {
    const available = deck
      .getAllNoteTypes()
      .map((n) => `${n.name} (${n.id})`)
      .join(", ");
    throw new Error(
      `No note type "${noteTypeId}" in deck "${deck.name}". Available: ${available || "none"}.`,
    );
  }
  return noteType;
};

export type CreateNoteResult = {
  noteId: string;
  noteTypeName: string;
  cardsCreated: number;
  set: { slug: string; name: string }[];
};

/**
 * Create a note and fill its text fields.
 *
 * Values are keyed by field slug, the same name card templates use. Display
 * names are deliberately not accepted: one field's display name can equal
 * another's slug, and resolving both would silently write to the wrong field.
 * A display name is recognised only to point at the slug to use instead.
 *
 * Everything is validated before anything is written, so a rejected call leaves
 * no partial note behind.
 */
export const createNote = async (
  deckId: string,
  noteTypeId: string,
  values: Record<string, string>,
): Promise<CreateNoteResult> => {
  const deck = getDeckOrThrow(deckId);

  const noteType = getNoteTypeOrThrow(deck, noteTypeId);

  const fields = noteType.getAllFields();
  if (fields.length === 0) {
    throw new Error(`Note type "${noteType.name}" has no fields, so a note cannot be created.`);
  }

  // Resolve every key first; a note with no content deletes itself on save, so
  // a half-applied write is worse than none.
  const resolved: { field: AnyNoteField; value: string }[] = [];
  const problems: string[] = [];

  for (const [key, rawValue] of Object.entries(values)) {
    const field = fields.find((f) => f.slug === key);

    if (field === undefined) {
      const byName = fields.find(
        (f) => f.name === key || f.name.toLowerCase() === key.toLowerCase(),
      );
      problems.push(
        byName
          ? `"${key}" is the display name of a field; use its template name "${byName.slug}" instead.`
          : `"${key}" is not a field of "${noteType.name}". Its fields are: ` +
            fields.map((f) => f.slug).join(", "),
      );
      continue;
    }
    const schema = describeField(field);
    if (!schema.writable) {
      problems.push(`"${key}" is a ${schema.kind} field — ${schema.readOnlyReason}.`);
      continue;
    }
    const value = typeof rawValue === "string" ? rawValue : String(rawValue);
    if (value.trim() === "") {
      problems.push(`"${key}" is empty. Empty fields are not stored.`);
      continue;
    }
    resolved.push({ field, value });
  }

  if (problems.length > 0) {
    throw new Error(problems.join("\n"));
  }
  if (resolved.length === 0) {
    throw new Error(
      "No content was supplied. A note with no content is discarded, so at least one " +
        "writable field must be given.",
    );
  }

  const note = noteType.createNewNote();
  for (const { field, value } of resolved) {
    field.getOrCreateContent(note).setContent(value);
  }
  await deck.persist();

  return {
    noteId: note.id,
    noteTypeName: noteType.name,
    cardsCreated: note.getAllCards().length,
    set: resolved.map(({ field }) => ({ slug: field.slug, name: field.name })),
  };
};

/* ========================================================================== *
 *  FIELDS
 * ========================================================================== */

export type AddFieldResult = {
  slug: string;
  name: string;
  noteTypeName: string;
  description?: string;
  notesAffected: number;
};

/**
 * Add a text field to a note type.
 *
 * Only text fields can be added here. The other kinds hold a file or generate
 * their own content, neither of which can be supplied through this interface,
 * so creating one would leave a field nothing could fill.
 */
export const addField = async (
  deckId: string,
  noteTypeId: string,
  { name, slug, description }: { name: string; slug?: string; description?: string },
): Promise<AddFieldResult> => {
  const deck = getDeckOrThrow(deckId);
  const noteType = getNoteTypeOrThrow(deck, noteTypeId);

  if (name.trim() === "") {
    throw new Error("A field name is required.");
  }

  // core validates an explicit slug and derives a unique one otherwise.
  const field = noteType.createNewField(TextField, {
    name: name.trim(),
    slug: slug?.trim() || undefined,
    description,
  });
  await deck.persist();

  return {
    slug: field.slug,
    name: field.name,
    noteTypeName: noteType.name,
    description: field.description,
    notesAffected: noteType.getAllNotes().length,
  };
};

export type FieldDeletionImpact = {
  slug: string;
  name: string;
  kind: FieldKind;
  /** Notes holding content in this field, which is what would be lost. */
  notesWithContent: number;
  totalNotes: number;
  /** Card templates that render this field, and would lose the value. */
  templatesUsingField: string[];
  /**
   * Deleting the last field leaves every note with nothing in it, and empty
   * notes are not kept.
   */
  isLastField: boolean;
};

export type DeleteFieldResult = {
  impact: FieldDeletionImpact;
  deleted: boolean;
  notesDeleted: number;
  noteTypeName: string;
};

const impactOf = (noteType: NoteType, field: AnyNoteField): FieldDeletionImpact => {
  const notes = noteType.getAllNotes();
  const slugs = new Set(noteType.getAllFields().map((f) => f.slug));

  return {
    slug: field.slug,
    name: field.name,
    kind: kindOf(field),
    notesWithContent: notes.filter((note) => {
      const content = field.getContent(note);
      return content !== undefined && !content.isEmpty();
    }).length,
    totalNotes: notes.length,
    templatesUsingField: noteType
      .getAllCardTemplates()
      .filter((template) => {
        const source = template
          .getAllVariants()
          .map((v) => `${v.front ?? ""}\n${v.back ?? ""}`)
          .join("\n");
        return fieldsUsedBy(source, slugs).includes(field.slug);
      })
      .map((t) => t.name),
    isLastField: noteType.getAllFields().length === 1,
  };
};

/**
 * Delete a field from a note type, removing its content from every note.
 *
 * Without `confirm` nothing is deleted and the impact is reported instead, so
 * what is about to be lost reaches the user before it goes. The change is local
 * until the next sync, but is not otherwise reversible.
 */
export const deleteField = async (
  deckId: string,
  noteTypeId: string,
  slug: string,
  confirm: boolean,
): Promise<DeleteFieldResult> => {
  const deck = getDeckOrThrow(deckId);
  const noteType = getNoteTypeOrThrow(deck, noteTypeId);

  const field = noteType.getAllFields().find((f) => f.slug === slug);
  if (field === undefined) {
    const byName = noteType.getAllFields().find((f) => f.name === slug);
    throw new Error(
      byName
        ? `"${slug}" is the display name of a field; use its template name "${byName.slug}" instead.`
        : `"${slug}" is not a field of "${noteType.name}". Its fields are: ` +
          noteType.getAllFields().map((f) => f.slug).join(", "),
    );
  }

  const impact = impactOf(noteType, field);
  if (!confirm) {
    return { impact, deleted: false, notesDeleted: 0, noteTypeName: noteType.name };
  }

  field.delete();
  await deck.persist();

  return {
    impact,
    deleted: true,
    notesDeleted: impact.isLastField ? impact.totalNotes : 0,
    noteTypeName: noteType.name,
  };
};

/* ========================================================================== *
 *  READING NOTES
 * ========================================================================== */

/** Defaults chosen to keep a tool result small enough to reason over. */
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;
const SNIPPET_RADIUS = 48;
const MAX_FIELD_LENGTH = 2000;

export type NoteFieldView = {
  slug: string;
  name: string;
  kind: FieldKind;
  /** Text content, or a description for a field holding a file. */
  value: string;
  truncated: boolean;
};

export type NoteView = {
  id: string;
  noteTypeId: string;
  noteTypeName: string;
  fields: NoteFieldView[];
  cards: { template: string; variant?: string }[];
};

export type NoteSummary = {
  id: string;
  noteTypeName: string;
  /** One line per field the query matched, or a preview when browsing. */
  lines: { slug: string; snippet: string }[];
};

export type SearchResult = {
  total: number;
  offset: number;
  returned: NoteSummary[];
  deckName: string;
};

const clampLimit = (limit?: number) =>
  Math.max(1, Math.min(limit ?? DEFAULT_LIMIT, MAX_LIMIT));

/**
 * Attachments cannot be sent over this transport, so they are described.
 * Saying so plainly stops a model reporting that it has seen the file.
 */
const describeValue = (field: AnyNoteField, note: Note): NoteFieldView => {
  const base = { slug: field.slug, name: field.name, kind: kindOf(field) };
  const content = field.getContent(note);

  if (content === undefined || content.isEmpty()) {
    return { ...base, value: "(empty)", truncated: false };
  }

  if (field instanceof TextField) {
    const text = content.getContent() ?? "";
    return {
      ...base,
      value: text.slice(0, MAX_FIELD_LENGTH),
      truncated: text.length > MAX_FIELD_LENGTH,
    };
  }

  const metadata = (
    content as { getAttachmentMetadata?: () => { filename: string; mimetype: string } | null }
  ).getAttachmentMetadata?.();

  return {
    ...base,
    value: metadata
      ? `(${metadata.mimetype} file "${metadata.filename}" — not shown here)`
      : "(file — not shown here)",
    truncated: false,
  };
};

export const viewNote = (deckId: string, noteId: string): NoteView => {
  const deck = getDeckOrThrow(deckId);
  const note = deck.getAllNotes().find((n) => n.id === noteId);
  if (note === undefined) {
    throw new Error(
      `No note "${noteId}" in deck "${deck.name}". Use search_notes or list_notes to find one.`,
    );
  }

  return {
    id: note.id,
    noteTypeId: note.noteTypeId,
    noteTypeName: note.noteType.name,
    fields: note.noteType.getAllFields().map((f) => describeValue(f, note)),
    cards: note.getAllCards().map((card) => ({
      template: card.getCardTemplate()?.name ?? "(unknown)",
      variant: card.getCardTemplateVariant()?.name,
    })),
  };
};

/**
 * Search, or browse when no query is given. Every match is counted so the
 * caller can say how many were found before showing a slice of them.
 */
export const findNotes = (
  deckId: string,
  {
    query,
    noteTypeId,
    fieldSlug,
    limit,
    offset = 0,
  }: {
    query?: string;
    noteTypeId?: string;
    fieldSlug?: string;
    limit?: number;
    offset?: number;
  },
): SearchResult => {
  const deck = getDeckOrThrow(deckId);
  if (noteTypeId !== undefined) getNoteTypeOrThrow(deck, noteTypeId);

  const matches = searchNotes(deck, { query, noteTypeId, fieldSlug });
  const from = Math.max(0, offset);
  const page = matches.slice(from, from + clampLimit(limit));

  return {
    total: matches.length,
    offset: from,
    deckName: deck.name,
    returned: page.map(({ note, fields }) => ({
      id: note.id,
      noteTypeName: note.noteType.name,
      lines:
        fields.length > 0
          ? fields.map(({ field, text, positions }) => ({
              slug: field.slug,
              snippet: buildSnippet(text, positions[0]!, query?.trim().length ?? 0, SNIPPET_RADIUS),
            }))
          : // Browsing: preview the note rather than highlighting nothing.
            noteTextFields(note)
              .slice(0, 2)
              .map(({ field, text }) => ({
                slug: field.slug,
                snippet: buildSnippet(text, 0, 0, SNIPPET_RADIUS * 2),
              })),
    })),
  };
};
