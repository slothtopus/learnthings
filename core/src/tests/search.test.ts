import { beforeEach, describe, expect, test } from "vitest";

import { ObjectManager } from "../object_manager/ObjectManager.js";
import { Deck } from "../Deck.js";
import { NoteType } from "../NoteType.js";
import { Note } from "../Note.js";
import { Card } from "../Card.js";
import {
  CardTemplate,
  CardTemplateVariant,
  CardTemplateBlock,
  CardWidgetSettings,
  CardTemplateAttachment,
} from "../CardTemplate.js";
import { TextField, TextFieldContent } from "../fields/fields.js";
import { generateId } from "../utils/ids.js";
import { searchNotes, noteTextFields, buildSnippet } from "../search.js";

const setup = () => {
  const deckId = generateId();
  const om = new ObjectManager(deckId)
    .register(Deck)
    .register(NoteType)
    .register(Note)
    .register(Card)
    .register(TextField)
    .register(TextFieldContent)
    .register(CardTemplate)
    .register(CardTemplateVariant)
    .register(CardTemplateBlock)
    .register(CardWidgetSettings)
    .register(CardTemplateAttachment);
  om.setObject(Deck.createNew(om, { id: deckId, name: "deck" }));
  const deck = om.getKeyObject() as Deck;

  const vocab = deck.createNewNoteType("vocab");
  const front = vocab.createNewField(TextField, { name: "Front", slug: "front" });
  const back = vocab.createNewField(TextField, { name: "Back", slug: "back" });

  const phrases = deck.createNewNoteType("phrases");
  const phrase = phrases.createNewField(TextField, { name: "Phrase", slug: "phrase" });

  const add = (
    noteType: NoteType,
    values: { field: TextField; value: string }[],
  ) => {
    const note = noteType.createNewNote();
    values.forEach(({ field, value }) => field.getOrCreateContent(note).setContent(value));
    return note;
  };

  add(vocab, [
    { field: front, value: "gato" },
    { field: back, value: "cat" },
  ]);
  add(vocab, [
    { field: front, value: "cão" },
    { field: back, value: "dog, a Cat's rival" },
  ]);
  add(phrases, [{ field: phrase, value: "o gato preto" }]);

  return { deck, vocab, phrases, front };
};

describe("searchNotes", () => {
  let ctx: ReturnType<typeof setup>;
  beforeEach(() => {
    ctx = setup();
  });

  test("matches across note types and fields", () => {
    const results = searchNotes(ctx.deck, { query: "gato" });
    expect(results).toHaveLength(2);
    // Notes have no meaningful intrinsic order, so compare as a set.
    expect(results.flatMap((r) => r.fields.map((f) => f.text)).sort()).toEqual([
      "gato",
      "o gato preto",
    ]);
  });

  test("ignores case by default", () => {
    expect(searchNotes(ctx.deck, { query: "cat" })).toHaveLength(2);
    expect(searchNotes(ctx.deck, { query: "CAT" })).toHaveLength(2);
  });

  test("respects caseSensitive when asked", () => {
    const results = searchNotes(ctx.deck, { query: "Cat", caseSensitive: true });
    expect(results).toHaveLength(1);
    expect(results[0]?.fields[0]?.text).toBe("dog, a Cat's rival");
  });

  test("reports every field a note matched in", () => {
    const results = searchNotes(ctx.deck, { query: "a" });
    const vocabHit = results.find((r) => r.fields.length > 1);
    expect(vocabHit).toBeDefined();
  });

  test("records each position of a repeated match", () => {
    const results = searchNotes(ctx.deck, { query: "o" });
    const phrase = results.find((r) => r.fields[0]?.text === "o gato preto");
    expect(phrase?.fields[0]?.positions).toEqual([0, 5, 11]);
  });

  test("filters by note type", () => {
    const results = searchNotes(ctx.deck, { query: "gato", noteTypeId: ctx.phrases.id });
    expect(results).toHaveLength(1);
    expect(results[0]?.fields[0]?.text).toBe("o gato preto");
  });

  test("filters by field slug", () => {
    expect(searchNotes(ctx.deck, { query: "cat", fieldSlug: "back" })).toHaveLength(2);
    expect(searchNotes(ctx.deck, { query: "cat", fieldSlug: "front" })).toHaveLength(0);
  });

  test("with no query, returns every note with nothing highlighted", () => {
    const results = searchNotes(ctx.deck, {});
    expect(results).toHaveLength(3);
    expect(results.every((r) => r.fields.length === 0)).toBe(true);
  });

  test("returns nothing when there is no match", () => {
    expect(searchNotes(ctx.deck, { query: "zebra" })).toEqual([]);
  });

  test("is ordered by note order, then id, so paging is stable", () => {
    const ids = () => searchNotes(ctx.deck, {}).map((r) => r.note.id);
    expect(ids()).toEqual(ids());
    // Nothing sets Note.order today, so the fallback is id order.
    expect(ids()).toEqual([...ids()].sort((a, b) => a.localeCompare(b)));

    // An explicit order takes precedence over it.
    const notes = ctx.deck.getAllNotes();
    const last = [...ids()].pop()!;
    notes.find((n) => n.id === last)!.setOrder(-1);
    expect(ids()[0]).toBe(last);
  });
});

describe("noteTextFields", () => {
  test("skips fields with no content", () => {
    const { deck, vocab } = setup();
    const extra = vocab.createNewField(TextField, { name: "Extra", slug: "extra" });
    const note = deck.getAllNotes()[0]!;

    expect(noteTextFields(note).map((v) => v.field.slug)).toEqual(["front", "back"]);
    extra.getOrCreateContent(note).setContent("filled");
    expect(noteTextFields(note).map((v) => v.field.slug)).toEqual([
      "front",
      "back",
      "extra",
    ]);
  });
});

describe("buildSnippet", () => {
  const long = `${"a".repeat(100)}NEEDLE${"b".repeat(100)}`;

  test("windows around the match and marks both cuts", () => {
    const snippet = buildSnippet(long, 100, 6, 10);
    expect(snippet).toBe(`…${"a".repeat(10)}NEEDLE${"b".repeat(10)}…`);
  });

  test("does not mark a cut it did not make", () => {
    expect(buildSnippet("short NEEDLE here", 6, 6, 50)).toBe("short NEEDLE here");
  });

  test("collapses whitespace so a snippet stays on one line", () => {
    expect(buildSnippet("a\n\n  b NEEDLE", 7, 6)).toBe("a b NEEDLE");
  });
});
