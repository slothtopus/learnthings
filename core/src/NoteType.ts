import { cacheByVersion, ObjectManager } from "./ObjectManager";
import { PersistableObject } from "./PersistableObject";
import type {
  PersistableObjectConstructor,
  PersistedObject,
} from "./PersistableObject";
import { NoteField } from "./NoteField";
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
    return [this.objectManager.deckId];
  }

  get parentId() {
    return this.id;
  }

  static createNewEmpty(
    objectManager: ObjectManager,
    { name }: { name: string }
  ) {
    return new NoteType({ ...PersistableObject.create(), name }, objectManager);
  }

  constructor(serialised: SerialisedNoteType, objectManager: ObjectManager) {
    super(serialised, objectManager);
    const { name } = serialised;
    this.name = name;
  }

  serialise(includeObjects = true): SerialisedNoteType {
    return {
      ...super.serialise(includeObjects),
      name: this.name,
    };
  }

  createNewField<
    O extends { name: string; noteTypeId: string },
    T extends PersistableObject<any>
  >(
    name: string,
    fieldClass: PersistableObjectConstructor<T, any, O>,
    options: Omit<O, "name" | "noteTypeId"> & { __brand?: never }
  ) {
    const field = fieldClass.createNewEmpty(this.objectManager, {
      ...(options ?? {}),
      name,
      noteTypeId: this.id,
    } as O);
    this.objectManager.setObject(field);
    return field as T;
    /*console.log(this.objectManager.getRegistryOrThrow({ doctype: 'notefield', subtype }));
    return this.objectManager.createNewEmpty(
      { doctype: 'notefield', subtype },
      { name, noteTypeId: this.id }
    ) as T;*/
  }

  @cacheByVersion(["notefield"])
  getAllFields() {
    return this.objectManager.query({
      include: { doctype: "notefield", noteTypeId: this.id },
    }) as NoteField<any>[];
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

  createNewNote() {
    const note = Note.createNewEmpty(this.objectManager, {
      noteTypeId: this.id,
    });
    this.objectManager.setObject(note);
    this.getAllCardTemplates().forEach((c) =>
      note.getOrCreateCardForTemplate(c.id)
    );
    return note;
    //return this.objectManager.createNewEmpty({ doctype: 'note' }, { noteTypeId: this.id }) as Note;
  }

  createNewCardTemplate(name: string) {
    const template = CardTemplate.createNewEmpty(this.objectManager, {
      name,
      noteTypeId: this.id,
    });
    this.objectManager.setObject(template);
    this.getAllNotes().forEach((n) =>
      n.getOrCreateCardForTemplate(template.id)
    );
    return template;
  }

  delete() {
    this.flagShouldDelete(true);
    this.objectManager.markDirtyQuery({ include: { noteTypeId: this.id } });
  }
}
