import { ObjectManager } from "../object_manager/ObjectManager";
import {
  PersistableObject,
  PersistedObject,
} from "../object_manager/PersistableObject";
import { Note } from "../Note";
import { combineIds } from "../utils/ids";
import { NoteField } from "./NoteField";
import type { AttachmentData } from "../utils/attachments";

export interface ContentContainer<TSerialised> {
  serialise(): TSerialised;
}

export interface ContentContainerClass<
  TCreateInput,
  TSerialised,
  TInstance extends ContentContainer<TSerialised>,
> {
  new (...args: any[]): TInstance;
  createNew(input: TCreateInput): TInstance | null;
}

export type CreateInputOf<TCls extends { createNew: (...args: any[]) => any }> =
  Parameters<TCls["createNew"]>[0];

export type InstanceOf<TCls extends abstract new (...args: any[]) => any> =
  InstanceType<TCls>;

export type SerialisedOf<
  TCls extends abstract new (...args: any[]) => {
    serialise: (...args: any[]) => any;
  },
> = ReturnType<InstanceType<TCls>["serialise"]>;

export type SerialisedFieldContent<TContentSerialised> = PersistedObject & {
  noteId: string;
  fieldId: string;
  content: TContentSerialised | null;
};

export abstract class NoteFieldContent<
  TField extends NoteField<any>,
  TContent extends ContentContainerClass<any, any, any>,
> extends PersistableObject<SerialisedFieldContent<SerialisedOf<TContent>>> {
  static doctype = "notefieldcontent";
  static subtype = "base";

  noteId: string;
  fieldId: string;

  content: InstanceOf<TContent> | null;

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
    serialised: SerialisedFieldContent<SerialisedOf<TContent>>,
    objectManager: ObjectManager,
  ) {
    super(serialised, objectManager);
    const { noteId, fieldId, content } = serialised;

    this.noteId = noteId;
    this.fieldId = fieldId;

    this.content = content !== null ? this.deserialiseContent(content) : null;
  }

  abstract deserialiseContent(
    content: SerialisedOf<TContent>,
  ): InstanceOf<TContent>;

  abstract setContent(content: CreateInputOf<TContent>): void;

  getContent() {
    return this.content
  }

  isEmpty() {
    return this.content === null;
  }

  serialise(...args: Parameters<PersistableObject<any>["serialise"]>) {
    return {
      ...super.serialise(...args),
      noteId: this.noteId,
      fieldId: this.fieldId,
      content: this.content?.serialise() ?? null,
    };
  }

  shouldDelete(): boolean {
    return super.shouldDelete() || this.isEmpty();
  }
}

class TextContentContainer {
  static createNew(text: string): TextContentContainer | null {
    return text === "" ? null : new TextContentContainer(text);
  }

  text: string;

  constructor(text: string) {
    this.text = text;
  }

  serialise() {
    return this.text;
  }

  getValue() {
    return this.text;
  }
}

class TextNoteFieldContent extends NoteFieldContent<
  any,
  typeof TextContentContainer
> {
  static createNew(
    objectManager: ObjectManager,
    { noteId, fieldId }: { noteId: string; fieldId: string },
  ) {
    return new TextNoteFieldContent(
      {
        ...PersistableObject.create(),
        noteId,
        fieldId,
        content: null,
      },
      objectManager,
    );
  }

  deserialiseContent(content: string) {
    return new TextContentContainer(content);
  }

  setContent(content: string): void {
    this.content = TextContentContainer.createNew(content);
  }

  resetToLastPersisted() {
    throw new Error("not implemented");
  }
}

export class TextNoteField extends NoteField<TextNoteFieldContent> {
  static doctype = "notefield";
  static subtype = "text";

  static createNew(
    objectManager: ObjectManager,
    { name, noteTypeId }: { name: string; noteTypeId: string },
  ) {
    return new TextNoteField(
      {
        ...PersistableObject.create(),
        name,
        noteTypeId,
      },
      objectManager,
    );
  }

  contentFactory(note: Note) {
    const content = TextNoteFieldContent.createNew(this.objectManager, {
      noteId: note.id,
      fieldId: this.id,
    });
    this.objectManager.setObject(content);
    return content;
  }
}

const om = new ObjectManager()
const note = Note.createNew(om, {noteTypeId: '123'})
const field = TextNoteField.createNew(new ObjectManager(), {name: 'test', noteTypeId: '123'})
const content = field.getOrCreateContent(note)
content.setContent('this is a test')
const container = content.getContent()
console.log(container?.getValue())




type AttachmentMetadata = {
    url?: string | undefined;
    filename: string;
    mimetype: string;
}

type AttachmentData = AttachmentMetadata & {data: Blob}

// attachments need to reference their parent wrapper to know the storage id

class AttachmentContentContainer {
  static createNew(attachmentData: AttachmentData): AttachmentContentContainer | null {
   const {data, ...metadata} = attachmentData
    const container= new AttachmentContentContainer(metadata)
    container._data = data
    return container
  }

  attachmentMetadata: AttachmentMetadata;
  _data?: Blob

  constructor(metadata: AttachmentMetadata) {
    this.attachmentMetadata = metadata;
  }

  serialise() {
    return this.attachmentMetadata;
  }

  fetchAttachment() {

  }
}

