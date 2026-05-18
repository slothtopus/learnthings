import { ObjectManager } from "./object_manager/ObjectManager";
import { cacheByVersion } from "./object_manager/utils";
import { PersistableObject } from "./object_manager/PersistableObject";
import type {
  PersistedObject,
  CreatablePersistableObjectConstructor,
} from "./object_manager/PersistableObject";
import { AnyNoteField } from "./fields/base";
import { Note } from "./Note";
import { CardTemplate } from "./CardTemplate";

export type SerialisedNoteType = {
  name: string;
  objects?: any[];
} & PersistedObject;

export class NoteType extends PersistableObject<SerialisedNoteType> {
  static doctype = "notetype";
  static subtype = "base";

  shouldPersistIfUnsaved = true;
  name: string;

  get relatedIds() {
    return [this.deck.id];
  }

  get parentId() {
    return this.id;
  }

  static createNew(objectManager: ObjectManager, { name }: { name: string }) {
    return new NoteType({ ...PersistableObject.create(), name }, objectManager);
  }

  constructor(serialised: SerialisedNoteType, objectManager: ObjectManager) {
    super(serialised, objectManager);
    const { name } = serialised;
    this.name = name;
  }

  setName(name: string) {
    if (name !== this.name) {
      this.markDirty();
    }
    this.name = name;
  }

  serialise(
    ...args: Parameters<PersistableObject<any>["serialise"]>
  ): SerialisedNoteType {
    return {
      ...super.serialise(...args),
      name: this.name,
    };
  }

  createNewField<
    O extends { name: string; noteTypeId: string },
    T extends PersistableObject<any>,
  >(
    name: string,
    fieldClass: CreatablePersistableObjectConstructor<T, any>,
    options: Omit<O, "name" | "noteTypeId"> & { __brand?: never },
  ) {
    const field = fieldClass.createNew(this.objectManager, {
      ...(options ?? {}),
      name,
      noteTypeId: this.id,
    } as O);
    this.objectManager.setObject(field);
    return field as T;
  }

  @cacheByVersion(["notefield"])
  getAllFields() {
    return this.objectManager.query({
      include: { doctype: "notefield", noteTypeId: this.id },
    }) as AnyNoteField[];
  }

  @cacheByVersion(["note"])
  getAllNotes() {
    return this.objectManager.query({
      include: { doctype: "note", noteTypeId: this.id },
    }) as Note[];
  }

  @cacheByVersion(["cardtemplate"])
  getAllCardTemplates() {
    return this.objectManager.query({
      include: { doctype: "cardtemplate", noteTypeId: this.id },
    }) as CardTemplate[];
  }

  @cacheByVersion(["card"])
  getAllCards() {
    return this.getAllCardTemplates().flatMap((c) => c.getAllCards());
  }

  createNewNote() {
    const note = Note.createNew(this.objectManager, {
      noteTypeId: this.id,
    });
    this.objectManager.setObject(note);
    this.getAllCardTemplates().forEach((c) =>
      note.getOrCreateCardForTemplate(c.id),
    );
    return this.objectManager.setObject(note);;
  }

  createNewCardTemplate(name: string) {
    const template = CardTemplate.createNew(this.objectManager, {
      name,
      noteTypeId: this.id,
    });
    this.objectManager.setObject(template);
    this.getAllNotes().forEach((n) =>
      n.getOrCreateCardForTemplate(template.id),
    );
    return template;
  }

  delete() {
    this.flagShouldDelete(true);
    this.objectManager.markDirtyQuery({ include: { noteTypeId: this.id } });
  }
}
