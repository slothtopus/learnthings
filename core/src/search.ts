import type { Deck } from "./Deck.js";
import type { Note } from "./Note.js";
import { TextField } from "./fields/fields.js";

/**
 * Searching note content.
 *
 * ObjectManager.query matches exact field values, which is no help for finding
 * a phrase inside a note, so this scans the deck's notes in memory. Only text
 * fields hold anything searchable; attachments and generated audio do not.
 *
 * Results are returned in full rather than paged, so a caller can report how
 * many matched before showing a slice of them.
 */

export type TextFieldValue = {
  field: TextField;
  text: string;
};

export type FieldMatch = TextFieldValue & {
  /** Where the query occurs in `text`, in order. */
  positions: number[];
};

export type NoteMatch = {
  note: Note;
  /** Fields the query was found in. Empty when browsing without a query. */
  fields: FieldMatch[];
};

export type NoteSearchOptions = {
  /** Omitted or empty browses rather than searches. */
  query?: string;
  noteTypeId?: string;
  /** Restrict to one field, by slug. */
  fieldSlug?: string;
  /** Defaults to false: matching ignores case unless asked otherwise. */
  caseSensitive?: boolean;
};

/** A note's text fields and their current values, in the note type's order. */
export const noteTextFields = (note: Note): TextFieldValue[] =>
  note.noteType
    .getAllFields()
    .filter((field): field is TextField => field instanceof TextField)
    .flatMap((field) => {
      const text = field.getContent(note)?.getContent();
      return typeof text === "string" && text !== "" ? [{ field, text }] : [];
    });

const positionsOf = (text: string, query: string, caseSensitive: boolean) => {
  const haystack = caseSensitive ? text : text.toLowerCase();
  const needle = caseSensitive ? query : query.toLowerCase();
  const positions: number[] = [];
  let from = 0;
  for (;;) {
    const at = haystack.indexOf(needle, from);
    if (at === -1) return positions;
    positions.push(at);
    // Overlapping matches are not interesting; step past this one.
    from = at + needle.length;
  }
};

/**
 * Notes are ordered by their explicit order where one is set, then by id, so
 * that paging through results is stable.
 */
const inStableOrder = (notes: Note[]) =>
  [...notes].sort((a, b) => {
    const ao = a.order ?? Number.MAX_SAFE_INTEGER;
    const bo = b.order ?? Number.MAX_SAFE_INTEGER;
    return ao !== bo ? ao - bo : a.id.localeCompare(b.id);
  });

export const searchNotes = (
  deck: Deck,
  { query, noteTypeId, fieldSlug, caseSensitive = false }: NoteSearchOptions = {},
): NoteMatch[] => {
  const needle = query?.trim() ?? "";
  const notes = inStableOrder(
    noteTypeId === undefined
      ? deck.getAllNotes()
      : deck.getAllNotes().filter((n) => n.noteTypeId === noteTypeId),
  );

  return notes.flatMap((note) => {
    const values = noteTextFields(note).filter(
      ({ field }) => fieldSlug === undefined || field.slug === fieldSlug,
    );

    // No query: every note is a result, with nothing highlighted.
    if (needle === "") {
      return fieldSlug !== undefined && values.length === 0 ? [] : [{ note, fields: [] }];
    }

    const fields = values.flatMap(({ field, text }) => {
      const positions = positionsOf(text, needle, caseSensitive);
      return positions.length > 0 ? [{ field, text, positions }] : [];
    });

    return fields.length > 0 ? [{ note, fields }] : [];
  });
};

/**
 * A window of `text` around a match, with an ellipsis where it was cut.
 * Whitespace is collapsed so a snippet stays on one line.
 */
export const buildSnippet = (
  text: string,
  position: number,
  length: number,
  radius = 48,
) => {
  const start = Math.max(0, position - radius);
  const end = Math.min(text.length, position + length + radius);
  const body = text.slice(start, end).replace(/\s+/g, " ").trim();
  return `${start > 0 ? "…" : ""}${body}${end < text.length ? "…" : ""}`;
};
