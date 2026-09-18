import { Deck } from "core/Deck.js";
import type { NoteType } from "core/NoteType.js";
import type { AnyNoteField } from "core/fields/base.js";
import { GeneratedField } from "core/fields/base.js";
import { TextField } from "core/fields/fields.js";
import {
  ImageAttachmentField,
  AudioAttachmentField,
} from "core/fields/fields.js";
import { TextToSpeechField } from "core/fields/generated.js";

import { getLoadedDeck, hasSynced } from "./registry.js";

export type FieldKind = "text" | "image" | "audio" | "text_to_speech" | "unknown";

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

export const kindOf = (field: AnyNoteField): FieldKind =>
  field instanceof TextField
    ? "text"
    : field instanceof ImageAttachmentField
      ? "image"
      : field instanceof AudioAttachmentField
        ? "audio"
        : field instanceof TextToSpeechField
          ? "text_to_speech"
          : "unknown";

const describeField = (field: AnyNoteField): FieldSchema => {
  const kind = kindOf(field);
  const base = {
    slug: field.slug,
    name: field.name,
    kind,
    description: field.description,
    mimetype: (field.options as { mimetype?: string } | null)?.mimetype,
  };

  if (kind === "text") return { ...base, writable: true };
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
const fieldsUsedBy = (source: string, slugs: Set<string>) => {
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

export type CreateNoteResult = {
  noteId: string;
  noteTypeName: string;
  cardsCreated: number;
  set: { slug: string; name: string }[];
};

/**
 * Create a note and fill its text fields.
 *
 * Values are keyed by field slug; the display name is accepted too, since that
 * is what a person is likely to say. Everything is validated before anything is
 * written, so a rejected call leaves no partial note behind.
 */
export const createNote = async (
  deckId: string,
  noteTypeId: string,
  values: Record<string, string>,
): Promise<CreateNoteResult> => {
  const deck = getDeckOrThrow(deckId);

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

  const fields = noteType.getAllFields();
  if (fields.length === 0) {
    throw new Error(`Note type "${noteType.name}" has no fields, so a note cannot be created.`);
  }

  // Resolve every key first; a note with no content deletes itself on save, so
  // a half-applied write is worse than none.
  const resolved: { field: AnyNoteField; value: string }[] = [];
  const problems: string[] = [];

  for (const [key, rawValue] of Object.entries(values)) {
    const field =
      fields.find((f) => f.slug === key) ??
      fields.find((f) => f.name === key) ??
      fields.find((f) => f.slug.toLowerCase() === key.toLowerCase()) ??
      fields.find((f) => f.name.toLowerCase() === key.toLowerCase());

    if (field === undefined) {
      problems.push(
        `"${key}" is not a field of "${noteType.name}". Its fields are: ` +
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
