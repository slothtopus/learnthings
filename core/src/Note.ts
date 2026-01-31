import { PersistableObject } from "./PersistableObject";
import type { PersistedObject } from "./PersistableObject";
import type { ObjectManager } from "./ObjectManager";

import { Card } from "./Card";
import type { NoteFieldContent } from "./NoteField";
import type { NoteType } from "./NoteType";

import { combineIds } from "./utils/ids";
import { GeneratedNoteField } from "./fields/GeneratedNoteField";

export type SerialisedNote = {
  noteTypeId: string;
  order?: number;
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

  order: number | undefined;

  static createNew(
    objectManager: ObjectManager,
    { noteTypeId }: { noteTypeId: string },
  ) {
    return new Note(
      { ...PersistableObject.create(), noteTypeId, order: undefined },
      objectManager,
    );
  }

  constructor(serialised: SerialisedNote, objectManager: ObjectManager) {
    super(serialised, objectManager);
    const { noteTypeId, order } = serialised;
    this.noteTypeId = noteTypeId;
    this.order = order;
  }

  serialise(
    ...args: Parameters<PersistableObject<any>["serialise"]>
  ): SerialisedNote {
    return {
      ...super.serialise(...args),
      noteTypeId: this.noteTypeId,
      order: this.order,
    };
  }

  setOrder(order: number) {
    this.order = order;
    this.markDirty();
  }

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
      includeDeleted,
    ) as NoteFieldContent<any, any>[];
  }

  getFieldContentByName(name: string) {
    const field = this.getFieldByName(name);
    return field.getContent(this);
  }

  getInternalContext() {
    return this.order !== undefined ? { "note:order": this.order } : {};
  }

  getCardForTemplate(cardTemplateId: string) {
    return this.objectManager.getObjectById(
      combineIds([this.id, cardTemplateId]),
    ) as Card;
  }

  getOrCreateCardForTemplate(cardTemplateId: string) {
    let card = this.getCardForTemplate(cardTemplateId);
    if (card === undefined) {
      card = Card.createNew(this.objectManager, {
        noteId: this.id,
        cardTemplateId,
      });
      this.objectManager.setObject(card);
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
        true,
      )
      .forEach((o) => o.flagShouldDelete(true));
    this.objectManager
      .query(
        {
          include: { doctype: "card", noteId: this.id },
        },
        true,
      )
      .forEach((o) => o.flagShouldDelete(true));
  }

  resetToLastPersisted() {
    this.getAllFieldContent().forEach((c) => c.resetToLastPersisted());
  }

  get isGenerating() {
    return this.noteType
      .getAllFields()
      .filter((f) => f instanceof GeneratedNoteField)
      .some((f) => f.isGenerating);
  }

  async generateAll() {
    const generatedFields = this.noteType
      .getAllFields()
      .filter((f) => f instanceof GeneratedNoteField);
    const toGenerate = generatedFields.filter(
      (f) => f.canGenerate(this) && f.shouldGenerate(this),
    );
    await Promise.all(toGenerate.map((f) => f.generate(this)));
  }
}
