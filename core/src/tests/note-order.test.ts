import { describe, expect, test } from "vitest";

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

const setup = (count: number) => {
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
  const noteType = deck.createNewNoteType("t");
  const field = noteType.createNewField(TextField, { name: "front" });
  for (let i = 0; i < count; i++) {
    const note = noteType.createNewNote();
    field.getOrCreateContent(note).setContent(`note ${i}`);
  }
  return deck;
};

const ids = (deck: Deck) => deck.getAllNotesOrdered().map((n) => n.id);

describe("Deck.getAllNotesOrdered", () => {
  test("returns the same notes as getAllNotes", () => {
    const deck = setup(5);
    expect([...ids(deck)].sort()).toEqual(deck.getAllNotes().map((n) => n.id).sort());
  });

  test("falls back to id order while nothing sets an explicit order", () => {
    const deck = setup(5);
    expect(ids(deck)).toEqual([...ids(deck)].sort((a, b) => a.localeCompare(b)));
  });

  test("is stable across calls", () => {
    const deck = setup(5);
    expect(ids(deck)).toEqual(ids(deck));
  });

  test("puts explicitly ordered notes first, in their order", () => {
    const deck = setup(5);
    const [a, b] = [...ids(deck)].reverse();
    const find = (id: string) => deck.getAllNotes().find((n) => n.id === id)!;

    find(a!).setOrder(1);
    find(b!).setOrder(0);

    // setOrder only marks the note dirty; it does not bump the note version, so
    // this would fail if the ordering were cached by version.
    expect(ids(deck).slice(0, 2)).toEqual([b, a]);
  });

  test("does not disturb getAllNotes", () => {
    const deck = setup(3);
    const before = deck.getAllNotes();
    deck.getAllNotesOrdered();
    expect(deck.getAllNotes()).toEqual(before);
  });
});
