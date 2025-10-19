import { PersistableObject } from "./PersistableObject";
import type { PersistedObject } from "./PersistableObject";
import type { ObjectManager } from "./ObjectManager";

import { Card } from "./Card";
import type { NoteFieldContent } from "./NoteField";
import type { CardTemplate } from "./CardTemplate";
import type { NoteField } from "./NoteField";
import type { NoteType } from "./NoteType";

import { combineIds } from "./utils/ids";

export type SerialisedNote = {
  noteTypeId: string;
} & PersistedObject;

export class Note extends PersistableObject<SerialisedNote> {
  static doctype = "note";
  static subtype = "note";

  shouldPersistIfUnsaved = false;

  get noteType() {
    return this.objectManager.getObjectById(this.noteTypeId) as NoteType;
  }
  noteTypeId: string;

  get relatedIds() {
    return [this.noteTypeId];
  }

  static createNewEmpty(
    objectManager: ObjectManager,
    { noteTypeId }: { noteTypeId: string }
  ) {
    return new Note(
      { ...PersistableObject.create(), noteTypeId },
      objectManager
    );
  }

  constructor(serialised: SerialisedNote, objectManager: ObjectManager) {
    super(serialised, objectManager);
    const { noteTypeId } = serialised;
    this.noteTypeId = noteTypeId;
  }

  serialise(includeObjects = true): SerialisedNote {
    return {
      ...super.serialise(includeObjects),
      noteTypeId: this.noteTypeId,
    };
  }

  // --------------- Queries that we might want to cache --------------
  /*getAllFields() {
    return this.objectManager.query({
      include: { doctype: "notefield", noteTypeId: this.noteTypeId },
    }) as NoteField<any>[];
  }

  getAllCardTemplates() {
    return this.objectManager.query({
      include: { doctype: "cardtemplate", noteTypeId: this.noteTypeId },
    }) as CardTemplate[];
  }*/
  // --------------- End queries that we might want to cache --------------

  getFieldByName(name: string) {
    const field = this.noteType
      .getAllFields()
      .filter((f) => f.name === name)[0];
    if (field === undefined) {
      throw new Error(`Field with name ${name} not found`);
    }
    return field;
  }

  getAllFieldContent(includeDeleted: boolean = false) {
    return this.objectManager.query(
      {
        include: { doctype: "notefieldcontent", noteId: this.id },
      },
      includeDeleted
    ) as NoteFieldContent<any, any>[];
  }

  getFieldContentByName(name: string) {
    const field = this.getFieldByName(name);
    return field.getContent(this);
  }

  /*getFieldContent<F extends NoteField<any>>(
    field: F
  ): ReturnType<F["getContent"]> {
    return field.getContent(this);
  }

  setFieldContent<F extends NoteField<any>>(
    field: F,
    content: Parameters<ReturnType<F["getContent"]>["setContent"]>[0]
  ) {
    field.getOrCreateContent(this).setContent(content);
    this.markDirty();
  }*/

  getAllContent() {
    return this.noteType.getAllFields().map((f) => ({
      name: f.name,
      content: f.getContent(this).content,
    }));
  }

  getCardForTemplate(cardTemplateId: string) {
    return this.objectManager.getObjectById(
      combineIds([this.id, cardTemplateId])
    ) as Card;
  }

  getOrCreateCardForTemplate(cardTemplateId: string) {
    let card = this.getCardForTemplate(cardTemplateId);
    if (card === undefined) {
      card = Card.createNewEmpty(this.objectManager, {
        noteId: this.id,
        cardTemplateId,
      });
      this.objectManager.setObject(card);
      console.log("getOrCreateCardForTemplate: created card", card.toString());
    }
    return card;
  }

  getAllCards() {
    const cards = this.noteType
      .getAllCardTemplates()
      .map((t) => this.getOrCreateCardForTemplate(t.id)) as Card[];
    return cards;
  }

  shouldDelete(): boolean {
    return super.shouldDelete() || this.noteType.getAllFields().length === 0;
  }

  delete() {
    this.flagShouldDelete(true);
    this.objectManager
      .query(
        {
          include: { doctype: "notefieldcontent", noteId: this.id },
        },
        true
      )
      .forEach((o) => o.flagShouldDelete(true));
    this.objectManager
      .query(
        {
          include: { doctype: "card", noteId: this.id },
        },
        true
      )
      .forEach((o) => o.flagShouldDelete(true));
  }

  resetToLastPersisted() {
    this.getAllFieldContent().forEach((c) => c.resetToLastPersisted());
  }
}
