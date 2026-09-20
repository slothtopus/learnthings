import { ObjectManager } from "./object_manager/ObjectManager.js";
import { cacheByVersion } from "./object_manager/utils.js";
import { PersistableObject } from "./object_manager/PersistableObject.js";
import type {
  PersistedObject,
  CreatablePersistableObjectConstructor,
} from "./object_manager/PersistableObject.js";
import type {
  AnyNoteField,
  NoteFieldClass,
  FieldOptionsArg,
} from "./fields/base.js";
import { Note } from "./Note.js";
import { CardTemplate } from "./CardTemplate.js";
import { slugify, uniqueSlug, isValidSlug } from "./utils/slug.js";

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
  createNewField<C extends NoteFieldClass>(
    fieldClass: C,
    {
      name,
      slug,
      description,
      options,
    }: {
      name: string;
      slug?: string;
      description?: string;
    } & FieldOptionsArg<InstanceType<C>>,
  ): InstanceType<C> {
    // setSlug cannot check this for us: the field is not registered yet, so it
    // cannot see its siblings. An explicit slug is validated here instead, so a
    // field can never be created with a name no template could reference.
    if (slug !== undefined) {
      if (!isValidSlug(slug)) {
        throw new Error(
          `"${slug}" cannot be used in a card template. Use letters, numbers and ` +
            `underscores, starting with a letter or underscore.`,
        );
      }
      const clash = this.getAllFields().find((f) => f.slug === slug);
      if (clash) {
        throw new Error(
          `Template name "${slug}" is already used by the field "${clash.name}".`,
        );
      }
    }

    const field = fieldClass.createNew(this.objectManager, {
      name,
      noteTypeId: this.id,
      slug: slug ?? this.availableFieldSlug(name),
      description,
      options,
    });
    return this.objectManager.setObject(field) as InstanceType<C>;
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
    const note = this.objectManager.setObject(
      Note.createNew(this.objectManager, { noteTypeId: this.id }),
    );
    this.getAllCardTemplates().forEach((c) =>
      note.getOrCreateCardForTemplate(c.id),
    );
    return note;
  }

  createNewCardTemplate(name: string) {
    const template = this.objectManager.setObject(
      CardTemplate.createNew(this.objectManager, {
        name,
        noteTypeId: this.id,
      }),
    );
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
