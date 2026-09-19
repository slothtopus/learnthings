import { ObjectManager } from "./object_manager/ObjectManager.js";
import { cacheByVersion } from "./object_manager/utils.js";
import { PersistableObject } from "./object_manager/PersistableObject.js";
import type {
  PersistedObject,
  CreatablePersistableObjectConstructor,
} from "./object_manager/PersistableObject.js";
import { AnyNoteField } from "./fields/base.js";
import { Note } from "./Note.js";
import { CardTemplate } from "./CardTemplate.js";
import { slugify, uniqueSlug } from "./utils/slug.js";

export type SerialisedNoteType = {
  name: string;
  /** What kind of note this is, and what its fields are for. */
  description?: string;
  objects?: any[];
} & PersistedObject;

export class NoteType extends PersistableObject<SerialisedNoteType> {
  static doctype = "notetype";
  static subtype = "base";

  shouldPersistIfUnsaved = true;
  name: string;
  description?: string;

  get relatedIds() {
    return [this.deck.id];
  }

  get parentId() {
    return this.id;
  }

  static createNew(
    objectManager: ObjectManager,
    { name, description }: { name: string; description?: string },
  ) {
    return new NoteType(
      { ...PersistableObject.create(), name, description },
      objectManager,
    );
  }

  constructor(serialised: SerialisedNoteType, objectManager: ObjectManager) {
    super(serialised, objectManager);
    const { name, description } = serialised;
    this.name = name;
    this.description = description;
  }

  setName(name: string) {
    if (name !== this.name) {
      this.markDirty();
    }
    this.name = name;
  }

  setDescription(description: string | undefined) {
    const next = description?.trim() ? description.trim() : undefined;
    if (next !== this.description) {
      this.description = next;
      this.markDirty();
    }
  }

  /** A template-safe slug derived from `name` that no existing field uses. */
  availableFieldSlug(name: string) {
    return uniqueSlug(
      slugify(name),
      this.getAllFields().map((f) => f.slug),
    );
  }

  serialise(
    ...args: Parameters<PersistableObject<any>["serialise"]>
  ): SerialisedNoteType {
    return {
      ...super.serialise(...args),
      name: this.name,
      description: this.description,
    };
  }

  /**
   * Create a field on this note type.
   *
   * Takes a single descriptor rather than positional arguments so it reads the
   * same way as NoteField.createNew, and so adding further field metadata does
   * not keep extending the signature. `options` stays separate because it is
   * the field type's own settings — a mimetype, a TTS voice — persisted as an
   * opaque blob, whereas name, slug and description are properties every field
   * has and are persisted in their own right.
   *
   * `slug` defaults to a template-safe form of `name`, unique within this note
   * type.
   */
  createNewField<
    O extends { name: string; noteTypeId: string },
    T extends PersistableObject<any>,
  >(
    fieldClass: CreatablePersistableObjectConstructor<T, any>,
    {
      name,
      slug,
      description,
      options,
    }: {
      name: string;
      slug?: string;
      description?: string;
      options?: Omit<O, "name" | "noteTypeId" | "slug" | "description">;
    },
  ) {
    const field = fieldClass.createNew(this.objectManager, {
      ...(options ?? {}),
      name,
      noteTypeId: this.id,
      slug: slug ?? this.availableFieldSlug(name),
      description,
    } as unknown as O);
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
