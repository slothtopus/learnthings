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
import { getOrCreateLocalDeckDB } from "../service/PouchDB.js";
import { generateId } from "../utils/ids.js";

/** Every persisted object, including those embedded in a root document. */
const allObjects = async (om: ObjectManager) => {
  const rows = await om.getDB().allDocs({ include_docs: true });
  const out: any[] = [];
  const walk = (o: any) => {
    out.push(o);
    (o.objects ?? []).forEach(walk);
  };
  rows.rows
    .map((r) => r.doc as any)
    .filter((d) => d && !String(d._id).startsWith("_design"))
    .forEach(walk);
  return out;
};

const countOf = (objects: any[], doctype: string) =>
  objects.filter((o) => o.doctype === doctype).length;

const setup = async () => {
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
  om.db = await getOrCreateLocalDeckDB("test-user", deckId, true);

  om.setObject(Deck.createNew(om, { id: deckId, name: "deck" }));
  const deck = om.getKeyObject() as Deck;
  const noteType = deck.createNewNoteType("type");
  const front = noteType.createNewField(TextField, { name: "front" });
  const back = noteType.createNewField(TextField, { name: "back" });

  const template = noteType.createNewCardTemplate("card");
  const variant = template.getDefaultVariant();
  variant.setFront("<p>{{front}}</p>");
  variant.setBack("<p>{{front}} / {{back}}</p>");

  const note = noteType.createNewNote();
  front.getOrCreateContent(note).setContent("FRONT VALUE");
  back.getOrCreateContent(note).setContent("BACK VALUE");
  await deck.persist();

  return { om, deck, noteType, front, back, note };
};

describe("deleting a field", () => {
  let ctx: Awaited<ReturnType<typeof setup>>;
  beforeEach(async () => {
    ctx = await setup();
  });

  test("removes the field's content from every note", async () => {
    const { om, deck, front } = ctx;
    expect(countOf(await allObjects(om), "notefieldcontent")).toBe(2);

    front.delete();
    await deck.persist();

    const objects = await allObjects(om);
    expect(countOf(objects, "notefield")).toBe(1);
    // The deleted field's content goes with it; the other field's stays.
    expect(countOf(objects, "notefieldcontent")).toBe(1);
    expect(countOf(objects, "note")).toBe(1);
  });

  test("leaves the remaining fields' content intact", async () => {
    const { deck, front, back, note } = ctx;
    front.delete();
    await deck.persist();

    expect(back.getContent(note)?.getContent()).toBe("BACK VALUE");
  });

  test("cards still render, with the deleted field blank", async () => {
    const { deck, front, note } = ctx;
    const card = note.getAllCards()[0]!;
    expect((await card.renderBack()).html).toContain("FRONT VALUE");

    front.delete();
    await deck.persist();

    // Previously this threw reaching for the missing field's slug.
    const rendered = await card.renderBack();
    expect(rendered.html).not.toContain("FRONT VALUE");
    expect(rendered.html).toContain("BACK VALUE");
  });

  test("deleting the last field removes the notes it left empty", async () => {
    const { om, deck, front, back } = ctx;
    front.delete();
    back.delete();
    await deck.persist();

    // By design: a note with no fields holds nothing worth storing.
    const objects = await allObjects(om);
    expect(countOf(objects, "notefield")).toBe(0);
    expect(countOf(objects, "note")).toBe(0);
    expect(countOf(objects, "notefieldcontent")).toBe(0);
    expect(countOf(objects, "card")).toBe(0);
  });

  test("an ordinary save does not remove content", async () => {
    const { om, deck, note, front } = ctx;
    front.getOrCreateContent(note).setContent("CHANGED");
    await deck.persist();

    expect(countOf(await allObjects(om), "notefieldcontent")).toBe(2);
  });
});
