import { NoteField } from "./NoteField";
import type {
  SerialisedNoteFieldContent,
  SerialisedAttachmentData,
} from "./NoteField";
import { NoteFieldContent } from "./NoteField";
import type { Note } from "../Note";
import type { ObjectManager } from "../object_manager/ObjectManager";
import { PersistableObject } from "../object_manager/PersistableObject";
import { AttachmentData } from "../utils/attachments";

export abstract class GeneratedNoteField<
  TContent extends NoteFieldContent<any, any>,
> extends NoteField<TContent> {
  abstract generate(note: Note): Promise<void>;
  abstract canGenerate(note: Note): boolean;
  abstract shouldGenerate(note: Note): boolean;
  isGenerating: boolean = false;
}

export type SerialisedGeneratedAttachmentNoteFieldContent<TSource> =
  SerialisedNoteFieldContent & {
    sourceContent?: TSource;
    attachment?: SerialisedAttachmentData;
  };

export class GeneratedAttachmentNoteFieldContent<
  TSource,
> extends NoteFieldContent<
  { sourceContent: TSource; attachment: AttachmentData },
  SerialisedGeneratedAttachmentNoteFieldContent<TSource>
> {
  static doctype = "notefieldcontent";
  static subtype = "generated_attachment";

  get parentId() {
    return this.id;
  }

  get field() {
    return super.field as any;
  }

  sourceContent?: TSource;
  attachment?: SerialisedAttachmentData;
  _data?: Blob;

  static createNew(
    objectManager: ObjectManager,
    options: { noteId: string; fieldId: string },
  ) {
    return new GeneratedAttachmentNoteFieldContent(
      {
        ...PersistableObject.create(),
        ...options,
        attachment: undefined,
      },
      objectManager,
    );
  }

  constructor(
    serialised: SerialisedGeneratedAttachmentNoteFieldContent<TSource>,
    objectManager: ObjectManager,
  ) {
    super(serialised, objectManager);
    const { sourceContent, attachment } = serialised;
    this.sourceContent = sourceContent;
    this.attachment = attachment;
  }

  serialise(
    ...args: Parameters<PersistableObject<any>["serialise"]>
  ): SerialisedGeneratedAttachmentNoteFieldContent<TSource> {
    return {
      ...super.serialise(...args),
      sourceContent: this.sourceContent,
      attachment: this.attachment,
    };
  }

  setContent({
    sourceContent,
    attachment,
  }: {
    sourceContent: TSource;
    attachment: AttachmentData;
  }) {
    this.sourceContent = sourceContent;
    const { data, ...rest } = attachment;
    this._data = data;
    this.attachment = rest;
    this.markDirty();
  }

  isEmpty() {
    return this.attachment === undefined || this.sourceContent === undefined;
  }

  hasAttachment() {
    return true;
  }

  getAttachment() {
    if (this.attachment && this._data) {
      return {
        ...this.attachment,
        data: new Blob([this._data], { type: this.attachment.mimetype }),
      };
    } else {
      return null;
    }
  }

  async fetchAttachment(): Promise<AttachmentData | null> {
    this._data = await this.objectManager.fetchAttachment(this.id);
    return this.getAttachment();
  }

  _lastPersistedData: Blob | undefined;
  updateAfterPersist(_meta: any, lastPersistedTimestamp: number) {
    super.updateAfterPersist(_meta, lastPersistedTimestamp);
    this._lastPersistedData = this._data;
  }

  resetToLastPersisted() {
    super.resetToLastPersisted();
    if (this._lastPersisted) {
      this.attachment = this._lastPersisted.attachment;
      this.sourceContent = this._lastPersisted.sourceContent;
      this._data = this._lastPersistedData;
    }
  }
}



export type SerialisedGeneratedInlineNoteFieldContent<TSource, TContent = string> =
  SerialisedNoteFieldContent & {
    sourceContent?: TSource;
    content?: TContent;
  };

export class GeneratedInlineNoteFieldContent<
  TSource, TContent = string
> extends NoteFieldContent<
  { sourceContent: TSource; content: TContent },
  SerialisedGeneratedInlineNoteFieldContent<TSource, TContent>
> {
  static doctype = "notefieldcontent";
  static subtype = "generated_attachment";

  get parentId() {
    return this.id;
  }

  get field() {
    return super.field as any;
  }

  sourceContent?: TSource;
  content?: TContent;

  static createNew(
    objectManager: ObjectManager,
    options: { noteId: string; fieldId: string },
  ) {
    return new GeneratedAttachmentNoteFieldContent(
      {
        ...PersistableObject.create(),
        ...options,
        attachment: undefined,
      },
      objectManager,
    );
  }

  constructor(
    serialised: SerialisedGeneratedInlineNoteFieldContent<TSource, TContent>,
    objectManager: ObjectManager,
  ) {
    super(serialised, objectManager);
    const { sourceContent, content } = serialised;
    this.sourceContent = sourceContent;
    this.content = content;
  }

  serialise(
    ...args: Parameters<PersistableObject<any>["serialise"]>
  ): SerialisedGeneratedInlineNoteFieldContent<TSource, TContent> {
    return {
      ...super.serialise(...args),
      sourceContent: this.sourceContent,
      content: this.content,
    };
  }

  setContent({
    sourceContent,
    content,
  }: {
    sourceContent: TSource;
    content: TContent;
  }) {
    this.sourceContent = sourceContent;
    this.content = content
    this.markDirty();
  }

  isEmpty() {
    return this.content === undefined || this.sourceContent === undefined;
  }

  hasAttachment() {
    return false;
  }
}
