import { PersistableObject } from "./PersistableObject";
import type { PersistedObject } from "./PersistableObject";
import type { ObjectManager } from "./ObjectManager";
import type { Note } from "./Note";
import { combineIds } from "./utils/ids";
import {
  createAttachmentFromURL,
  areMimeTypesEqual,
} from "./utils/attachments";
import type { AttachmentData } from "./utils/attachments";
import { NoteType } from "./NoteType";

export type SerialisedNoteField = {
  noteTypeId: string;
  name: string;
} & PersistedObject;

export abstract class NoteField<
  C extends NoteFieldContent<any, SerialisedNoteFieldContent>
> extends PersistableObject<SerialisedNoteField> {
  static doctype = "notefield";
  static subtype = "base";

  shouldPersistIfUnsaved = true;
  name: string;

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

  constructor(serialised: SerialisedNoteField, objectManager: ObjectManager) {
    super(serialised, objectManager);
    const { name, noteTypeId } = serialised;
    this.noteTypeId = noteTypeId;
    this.name = name;
  }

  serialise(includeObjects = true): SerialisedNoteField {
    return {
      ...super.serialise(includeObjects),
      noteTypeId: this.noteTypeId,
      name: this.name,
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

  abstract contentFactory(note: Note): C;

  getContent(note: Note): C | undefined {
    const content = this.objectManager.getObjectById(
      combineIds([note.id, this.id])
    );
    return content as C | undefined;
  }

  getOrCreateContent(note: Note): C {
    const content = this.getContent(note);
    if (content === undefined) {
      return this.contentFactory(note);
    } else {
      return content as C;
    }
  }

  setName(name: string) {
    this.name = name;
    this.markDirty();
  }
}

export type SerialisedNoteFieldContent = {
  noteId: string;
  fieldId: string;
} & PersistedObject;

export abstract class NoteFieldContent<
  C,
  S extends SerialisedNoteFieldContent
> extends PersistableObject<S> {
  static doctype = "notefieldcontent";
  static subtype = "base";

  noteId: string;
  fieldId: string;

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
    return this.objectManager.getObjectById(this.fieldId) as NoteField<any>;
  }

  constructor(serialised: S, objectManager: ObjectManager) {
    super(serialised, objectManager);
    const { noteId, fieldId } = serialised;
    this.noteId = noteId;
    this.fieldId = fieldId;
  }

  serialise(includeObjects = true): SerialisedNoteFieldContent {
    return {
      ...super.serialise(includeObjects),
      noteId: this.noteId,
      fieldId: this.fieldId,
    };
  }

  abstract setContent(content: C): void;

  abstract isEmpty(): boolean;

  resetToLastPersisted() {
    if (this._lastPersisted) {
      this.noteId = this._lastPersisted.noteId;
      this.fieldId = this._lastPersisted.fieldId;
    }
  }

  shouldDelete(): boolean {
    return super.shouldDelete() || this.isEmpty();
  }
}

// ----------------------- Text Field -----------------------

export class TextNoteField extends NoteField<TextNoteFieldContent> {
  static doctype = "notefield";
  static subtype = "text";

  static createNewEmpty(
    objectManager: ObjectManager,
    { name, noteTypeId }: { name: string; noteTypeId: string }
  ) {
    return new TextNoteField(
      {
        ...PersistableObject.create(),
        name,
        noteTypeId,
      },
      objectManager
    );
  }

  contentFactory(note: Note) {
    const content = TextNoteFieldContent.createNewEmpty(this.objectManager, {
      noteId: note.id,
      fieldId: this.id,
    });
    this.objectManager.setObject(content);
    return content;
  }
}

export type SerialisedTextNoteFieldContent = SerialisedNoteFieldContent & {
  content: string | null;
};

export class TextNoteFieldContent extends NoteFieldContent<
  string,
  SerialisedTextNoteFieldContent
> {
  static doctype = "notefieldcontent";
  static subtype = "text";

  static createNewEmpty(
    objectManager: ObjectManager,
    options: { noteId: string; fieldId: string }
  ) {
    return new TextNoteFieldContent(
      {
        ...PersistableObject.create(),
        ...options,
        content: null,
      },
      objectManager
    );
  }

  content: string | null;

  constructor(
    serialised: SerialisedTextNoteFieldContent,
    objectManager: ObjectManager
  ) {
    super(serialised, objectManager);
    const { content } = serialised;
    this.content = content;
  }

  setContent(content: string | null) {
    if (content !== this.content) {
      this.markDirty();
    }
    this.content = content === "" ? null : content;
  }

  /*shouldDelete(): boolean {
    return super.shouldDelete() || this.content === null;
  }*/

  serialise(includeObjects = true): SerialisedTextNoteFieldContent {
    return { ...super.serialise(includeObjects), content: this.content };
  }

  isEmpty() {
    return this.content === null;
  }

  resetToLastPersisted() {
    super.resetToLastPersisted();
    if (this._lastPersisted) {
      this.content = this._lastPersisted.content;
    }
  }
}

// ----------------------- Attachment Field -----------------------

export type SerialisedAttachmentNoteField = SerialisedNoteField & {
  mimetype: string;
};

export class AttachmentNoteField extends NoteField<AttachmentNoteFieldContent> {
  static doctype = "notefield";
  static subtype = "attachment";

  static createNewEmpty(
    objectManager: ObjectManager,
    {
      name,
      noteTypeId,
      mimetype,
    }: { name: string; noteTypeId: string; mimetype: string }
  ) {
    return new AttachmentNoteField(
      {
        ...PersistableObject.create(),
        name,
        noteTypeId,
        mimetype,
      },
      objectManager
    );
  }

  mimetype: string;

  constructor(
    serialised: SerialisedAttachmentNoteField,
    objectManager: ObjectManager
  ) {
    super(serialised, objectManager);
    const { mimetype } = serialised;
    this.mimetype = mimetype;
  }

  contentFactory(note: Note) {
    const content = AttachmentNoteFieldContent.createNewEmpty(
      this.objectManager,
      {
        noteId: note.id,
        fieldId: this.id,
      }
    );
    console.log(
      `created attachment content ${content.id} in AttachmentNoteField.contentFactory`
    );
    this.objectManager.setObject(content);
    return content;
  }

  serialise(includeObjects = true) {
    return { ...super.serialise(includeObjects), mimetype: this.mimetype };
  }
}

export type SerialisedAttachmentData = {
  filename: string;
  mimetype: string;
  url?: string;
};

export type SerialisedAttachmentNoteFieldContent =
  SerialisedNoteFieldContent & {
    attachment?: SerialisedAttachmentData;
  };

export class AttachmentNoteFieldContent extends NoteFieldContent<
  AttachmentData,
  SerialisedAttachmentNoteFieldContent
> {
  static doctype = "notefieldcontent";
  static subtype = "attachment";

  attachment: SerialisedAttachmentData | undefined;
  _data?: Blob;

  static createNewEmpty(
    objectManager: ObjectManager,
    options: { noteId: string; fieldId: string }
  ) {
    return new AttachmentNoteFieldContent(
      {
        ...PersistableObject.create(),
        ...options,
        attachment: undefined,
      },
      objectManager
    );
  }

  get parentId() {
    return this.id;
  }

  get field() {
    return this.objectManager.getObjectById(
      this.fieldId
    ) as AttachmentNoteField;
  }

  constructor(
    serialised: SerialisedAttachmentNoteFieldContent,
    objectManager: ObjectManager
  ) {
    super(serialised, objectManager);
    const { attachment } = serialised;
    this.attachment = attachment;
  }

  setContent({ filename, mimetype, url, data }: AttachmentData) {
    if (!areMimeTypesEqual(this.field.mimetype, mimetype)) {
      throw new Error(
        `Attachment mimetype ${mimetype} does not match field mimetype ${this.field.mimetype}`
      );
    }

    this.attachment = { filename, mimetype, url };
    this._data = data;
    this.markDirty();
  }

  async setContentFromURL(url: string) {
    this.setContent(await createAttachmentFromURL(url));
  }

  serialise(includeObjects = true) {
    return {
      ...super.serialise(includeObjects),
      attachment: this.attachment,
    };
  }

  /*shouldDelete(): boolean {
    return super.shouldDelete() || this.attachment === undefined;
  }*/

  hasAttachment() {
    return true;
  }

  getAttachment() {
    if (this.attachment && this._data) {
      return { ...this.attachment, data: this._data };
    } else {
      return null;
    }
  }

  async fetchAttachment(): Promise<AttachmentData | null> {
    this._data = await this.objectManager.fetchAttachment(this.id);
    return this.getAttachment();
  }

  isEmpty() {
    return this.attachment === undefined;
  }

  _lastPersistedData: Blob | undefined;
  updateAfterPersist(_meta: any, lastPersistedTimestamp: number | null) {
    super.updateAfterPersist(_meta, lastPersistedTimestamp);
    this._lastPersistedData = this._data;
  }

  resetToLastPersisted() {
    super.resetToLastPersisted();
    if (this._lastPersisted) {
      this.attachment = this._lastPersisted.attachment;
      this._data = this._lastPersistedData;
    }
  }
}
