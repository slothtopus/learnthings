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

/**
 * Stands in for the frontend's ReactiveObjectManager, where objectsById is a
 * Vue reactive object and so hands back a proxy rather than the instance that
 * was stored.
 *
 * Anything creating an object has to return what the manager gives back, not
 * the object it passed in, or the caller ends up holding an instance whose
 * changes the UI never sees. Comparing identity is how that shows up here.
 */
const wrapped = new WeakMap<object, any>();
const proxyFor = (value: any) => {
  if (value === null || typeof value !== "object") return value;
  if (!wrapped.has(value)) wrapped.set(value, new Proxy(value, {}));
  return wrapped.get(value);
};

class ProxyingObjectManager extends ObjectManager {
  objectsById: Record<string, any> = this.makeStore();

  private makeStore() {
    return new Proxy({} as Record<string, any>, {
      get: (target, key) => proxyFor(target[key as string]),
    });
  }

  resetObjects(): void {
    this.objectsById = this.makeStore();
  }
}

const setup = () => {
  const deckId = generateId();
  const om = new ProxyingObjectManager(deckId)
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
  return { om, deck: om.getKeyObject() as Deck };
};

/** The object handed back must be the one the manager holds, proxy and all. */
const expectRegistered = (om: ObjectManager, obj: { id: string }) =>
  expect(obj).toBe(om.getObjectById(obj.id));

describe("objects returned after being registered", () => {
  let ctx: ReturnType<typeof setup>;
  beforeEach(() => {
    ctx = setup();
  });

  test("createNewNoteType", () => {
    const noteType = ctx.deck.createNewNoteType("t");
    expectRegistered(ctx.om, noteType);
  });

  test("createNewField", () => {
    const noteType = ctx.deck.createNewNoteType("t");
    const field = noteType.createNewField(TextField, { name: "front" });
    expectRegistered(ctx.om, field);
  });

  test("createNewCardTemplate", () => {
    const noteType = ctx.deck.createNewNoteType("t");
    const template = noteType.createNewCardTemplate("card");
    expectRegistered(ctx.om, template);
  });

  test("createNewNote", () => {
    const noteType = ctx.deck.createNewNoteType("t");
    noteType.createNewField(TextField, { name: "front" });
    const note = noteType.createNewNote();
    expectRegistered(ctx.om, note);
  });

  test("getOrCreateCardForTemplate", () => {
    const noteType = ctx.deck.createNewNoteType("t");
    noteType.createNewField(TextField, { name: "front" });
    const template = noteType.createNewCardTemplate("card");
    const note = noteType.createNewNote();

    const card = note.getOrCreateCardForTemplate(template.id);
    expectRegistered(ctx.om, card);
    // And the second call, which reads an existing card rather than creating one.
    expectRegistered(ctx.om, note.getOrCreateCardForTemplate(template.id));
  });

  test("getOrCreateContent", () => {
    const noteType = ctx.deck.createNewNoteType("t");
    const field = noteType.createNewField(TextField, { name: "front" });
    const note = noteType.createNewNote();

    const content = field.getOrCreateContent(note);
    expectRegistered(ctx.om, content);
  });
});
