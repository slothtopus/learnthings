import { ObjectManager } from "../object_manager/ObjectManager";
import {
  PersistableObject,
  PersistedObject,
} from "../object_manager/PersistableObject";
import { Note } from "../Note";
import { combineIds } from "../utils/ids";
import type { NoteType } from "../NoteType";
import { isEqual } from "lodash-es";

export type SerialisedNoteField<TOptions> = {
  noteTypeId: string;
  name: string;
  options: TOptions;
} & PersistedObject;

export abstract class NoteField<
  TContent extends NoteFieldContent<any, any, any>,
  TOptions,
  TSerialised extends SerialisedNoteField<TOptions> =
    SerialisedNoteField<TOptions>,
> extends PersistableObject<TSerialised> {
  static doctype = "notefield";
  static subtype = "base";

  shouldPersistIfUnsaved = true;
  name: string;
  options: TOptions;

  noteTypeId: string;
  get noteType() {
    return this.objectManager.getObjectById(this.noteTypeId) as NoteType;
  }

  get relatedIds() {
    return [this.noteTypeId];
  }

  get parentId() {
    return this.noteTypeId;
  }

  constructor(serialised: TSerialised, objectManager: ObjectManager) {
    super(serialised, objectManager);
    const { name, noteTypeId, options } = serialised;
    this.noteTypeId = noteTypeId;
    this.name = name;
    this.options = options;
  }

  serialise(
    ...args: Parameters<PersistableObject<any>["serialise"]>
  ): SerialisedNoteField<TOptions> {
    return {
      ...super.serialise(...args),
      noteTypeId: this.noteTypeId,
      name: this.name,
      options: this.options,
    };
  }

  delete() {
    this.flagShouldDelete(true);
    this.objectManager.markDirtyQuery({
      include: { doctype: "notefieldcontent", fieldId: this.id },
    });
    this.objectManager.markDirtyQuery({
      include: { doctype: "note", noteTypeId: this.noteTypeId },
    });
  }

  abstract contentFactory(note: Note): TContent;

  getContent(note: Note): TContent | undefined {
    const content = this.objectManager.getObjectById(
      combineIds([note.id, this.id]),
    );
    return content as TContent | undefined;
  }

  getOrCreateContent(note: Note): TContent {
    const content = this.getContent(note);
    if (content === undefined) {
      return this.contentFactory(note);
    } else {
      return content as TContent;
    }
  }

  setName(name: string) {
    if (name !== this.name) {
      this.name = name;
      this.markDirty();
    }
  }

  setOptions(options: TOptions) {
    if (!isEqual(options, this.options)) {
      this.options = options;
      this.markDirty();
    }
  }
}

export type SerialisedFieldContent<TContentSerialised> = PersistedObject & {
  noteId: string;
  fieldId: string;
  content: TContentSerialised | null;
  contentMeta?: any
};

export abstract class NoteFieldContent<
  TField extends NoteField<any, any>,
  TContent,
  TContentSerialised = TContent,
> extends PersistableObject<SerialisedFieldContent<TContentSerialised>> {
  static doctype = "notefieldcontent";
  static subtype = "base";

  noteId: string;
  fieldId: string;

  content: TContent | null;
  contentMeta?: any

  get noteTypeId() {
    return (this.objectManager.getObjectById(this.noteId) as Note).noteTypeId;
  }

  get relatedIds() {
    return [this.noteId, this.fieldId];
  }

  get id() {
    return combineIds([this.noteId, this.fieldId]);
  }

  get parentId() {
    return this.noteId;
  }

  get field() {
    return this.objectManager.getObjectById(this.fieldId) as TField;
  }

  constructor(
    serialised: SerialisedFieldContent<TContentSerialised>,
    objectManager: ObjectManager,
  ) {
    super(serialised, objectManager);
    const { noteId, fieldId, content, contentMeta } = serialised;

    this.noteId = noteId;
    this.fieldId = fieldId;

    this.content = content !== null ? this.deserialiseContent(content) : null;
    this.contentMeta = contentMeta
  }

  deserialiseContent(content: TContentSerialised): TContent {
    return content as any;
  }

  serialiseContent(content: TContent): TContentSerialised {
    return content as any;
  }

  setContent(content: TContent, contentMeta?: any) {
    this.content = content;
    this.contentMeta = contentMeta
  }

  async getContent() {
    return this.content;
  }

  isEmpty() {
    return this.content === null;
  }

  serialise(...args: Parameters<PersistableObject<any>["serialise"]>) {
    return {
      ...super.serialise(...args),
      noteId: this.noteId,
      fieldId: this.fieldId,
      content:
        this.content === null ? null : this.serialiseContent(this.content),
    };
  }

  shouldDelete(): boolean {
    return super.shouldDelete() || this.isEmpty();
  }
}
