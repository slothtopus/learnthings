import { describe, expect, test } from "vitest";

import { ObjectManager } from "../object_manager/ObjectManager.js";
import { Deck } from "../Deck.js";
import { NoteType } from "../NoteType.js";
import { TextField, ImageAttachmentField } from "../fields/fields.js";
import { TextToSpeechField } from "../fields/generated.js";
import { generateId } from "../utils/ids.js";

/** A note type inside a deck; a note type needs its deck to resolve relatedIds. */
const newNoteType = () => {
  const deckId = generateId();
  const om = new ObjectManager(deckId)
    .register(Deck)
    .register(NoteType)
    .register(TextField)
    .register(ImageAttachmentField)
    .register(TextToSpeechField);
  om.setObject(Deck.createNew(om, { id: deckId, name: "test deck" }));
  const deck = om.getKeyObject() as Deck;
  return deck.createNewNoteType("test");
};

describe("createNewField", () => {
  test("derives a slug from the name and keeps it unique", () => {
    const noteType = newNoteType();
    const a = noteType.createNewField(TextField, { name: "Front of card" });
    const b = noteType.createNewField(TextField, { name: "Front of card" });

    expect(a.slug).toBe("front_of_card");
    expect(b.slug).toBe("front_of_card_2");
  });

  test("accepts an explicit slug and description", () => {
    const noteType = newNoteType();
    const field = noteType.createNewField(TextField, {
      name: "Front of card",
      slug: "front",
      description: "Shown first",
    });

    expect(field.slug).toBe("front");
    expect(field.description).toBe("Shown first");
  });

  test("applies the field type's options", () => {
    const noteType = newNoteType();
    const field = noteType.createNewField(ImageAttachmentField, {
      name: "Picture",
      options: { mimetype: "image/png" },
    });

    expect(field.options.mimetype).toBe("image/png");
  });

  test("returns the concrete field type", () => {
    const noteType = newNoteType();
    const field = noteType.createNewField(ImageAttachmentField, { name: "Picture" });

    expect(field).toBeInstanceOf(ImageAttachmentField);
    // Typed as ImageAttachmentField, not AnyNoteField: reading a type-specific
    // option would not compile otherwise.
    expect(typeof field.options.mimetype).toBe("string");
  });
});

/**
 * Compile-time assertions. Never executed — TypeScript checks the body, and an
 * unused @ts-expect-error is itself an error, so each line here fails the build
 * if the options argument stops being inferred from the field class.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _typeAssertions = (noteType: NoteType) => {
  // A field type with no options accepts none.
  // @ts-expect-error TextField has no options
  noteType.createNewField(TextField, { name: "a", options: { mimetype: "image/png" } });

  // @ts-expect-error mimetype is a string, not a number
  noteType.createNewField(ImageAttachmentField, { name: "b", options: { mimetype: 1 } });

  // @ts-expect-error unknown option
  noteType.createNewField(ImageAttachmentField, { name: "c", options: { nope: true } });

  // @ts-expect-error a language code outside the supported set
  noteType.createNewField(TextToSpeechField, { name: "d", options: { languageCode: "xx-XX" } });

  // @ts-expect-error name is required
  noteType.createNewField(TextField, {});

  // Options are optional even where the field type has them.
  noteType.createNewField(ImageAttachmentField, { name: "e" });
};
