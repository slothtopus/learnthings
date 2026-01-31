import { NoteField, TextNoteField } from "../NoteField";
import type {
  SerialisedNoteField,
  SerialisedNoteFieldContent,
  SerialisedAttachmentData,
} from "../NoteField";
import { NoteFieldContent } from "../NoteField";
import type { Note } from "../Note";
import type { ObjectManager } from "../ObjectManager";
import { PersistableObject } from "../PersistableObject";
import { AttachmentData, bufferToBlob } from "../utils/attachments";
import { GeminiTtsRequestInput } from "../generators/google_tts";
import { generateTextToSpeech } from "../generators/google_tts";
import { isEqual } from "lodash-es";

export type GeminiTtsOptions = Pick<
  GeminiTtsRequestInput,
  "languageCode" | "voiceName"
>;

export type SerialisedTextToSpeechNoteField = SerialisedNoteField & {
  sourceFieldId?: string;
  options: GeminiTtsOptions;
};

export abstract class GeneratedNoteField<
  TContent extends NoteFieldContent<any, any>,
> extends NoteField<TContent> {
  abstract generate(note: Note): Promise<void>;
  abstract canGenerate(note: Note): boolean;
  abstract shouldGenerate(note: Note): boolean;
  isGenerating: boolean = false;
}

export class TextToSpeechNoteField extends GeneratedNoteField<TextToSpeechNoteFieldContent> {
  static doctype = "notefield";
  static subtype = "generated_attachment";

  static createNew(
    objectManager: ObjectManager,
    {
      name,
      noteTypeId,
      sourceFieldId,
    }: { name: string; noteTypeId: string; sourceFieldId?: string },
  ) {
    return new TextToSpeechNoteField(
      {
        ...PersistableObject.create(),
        name,
        noteTypeId,
        sourceFieldId,
        options: {
          languageCode: "en-GB",
          voiceName: "Achernar",
        },
      },
      objectManager,
    );
  }

  sourceFieldId?: string;
  options: GeminiTtsOptions;

  get sourceField() {
    if (!this.sourceFieldId) {
      return undefined;
    } else {
      return this.objectManager.getObjectById(
        this.sourceFieldId,
      ) as TextNoteField;
    }
  }

  constructor(
    serialised: SerialisedTextToSpeechNoteField,
    objectManager: ObjectManager,
  ) {
    super(serialised, objectManager);
    const { sourceFieldId, options } = serialised;
    this.sourceFieldId = sourceFieldId;
    this.options = options;
  }

  getSourceContentOrThrow(note: Note) {
    if (this.sourceFieldId === undefined) {
      throw new Error("Source field not set");
    }
    const sourceField = this.objectManager.getObjectById(this.sourceFieldId);
    if (!(sourceField instanceof TextNoteField)) {
      throw new Error(`Cannot generate from source field: ${sourceField}`);
    }
    const sourceContent = sourceField.getContent(note);
    if (sourceContent === undefined || !sourceContent.content?.trim()) {
      throw new Error(
        `Cannot generate from text content: ${sourceContent?.content}`,
      );
    }

    return sourceContent.content;
  }

  contentFactory(note: Note) {
    const content = TextToSpeechNoteFieldContent.createNew(this.objectManager, {
      noteId: note.id,
      fieldId: this.id,
    });

    this.objectManager.setObject(content);

    return content;
  }

  async generate(note: Note) {
    const sourceText = this.getSourceContentOrThrow(note);
    try {
      this.isGenerating = true;

      const { audio } = await generateTextToSpeech({
        text: sourceText,
        languageCode: "af-ZA",
        voiceName: "Achird",
        ssml: false,
        audioEncoding: "MP3",
      });
      const blob = bufferToBlob(audio);
      const attachment = {
        filename: "generated.mp3",
        mimetype: "audio/*",
        data: blob,
      };
      this.getOrCreateContent(note).setContent({
        sourceContent: { options: this.options, sourceText },
        attachment,
      });
    } finally {
      this.isGenerating = false;
    }
  }

  serialise(...args: Parameters<PersistableObject<any>["serialise"]>) {
    return {
      ...super.serialise(...args),
      sourceFieldId: this.sourceFieldId,
      options: this.options,
    };
  }

  setSource(id: string) {
    if (id !== this.sourceFieldId) {
      this.sourceFieldId = id;
      this.markDirty();
    }
  }

  setOptions(options: GeminiTtsOptions) {
    if (!isEqual(options, this.options)) {
      this.options = options;
      this.markDirty();
    }
  }

  canGenerate(note: Note) {
    if (this.sourceFieldId === undefined) {
      return false;
    }
    const sourceField = this.objectManager.getObjectById(this.sourceFieldId);
    return (
      sourceField instanceof TextNoteField &&
      !!sourceField.getContent(note)?.content?.trim()
    );
  }

  shouldGenerate(note: Note) {
    if (this.sourceFieldId === undefined) {
      return false;
    }
    const sourceField = this.objectManager.getObjectById(this.sourceFieldId);
    if (sourceField instanceof TextNoteField) {
      const sourceContent = sourceField.getContent(note);
      const generatedContent = this.getContent(note);
      return (
        this.canGenerate(note) &&
        (generatedContent?.sourceContent?.sourceText !==
          sourceContent?.content ||
          !isEqual(generatedContent?.sourceContent?.options, this.options))
      );
    } else {
      return false;
    }
  }
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
    return super.field as TextToSpeechNoteField;
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
      return { ...this.attachment, data: this._data };
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

export class TextToSpeechNoteFieldContent extends GeneratedAttachmentNoteFieldContent<{
  options: GeminiTtsOptions;
  sourceText: string;
}> {
  static createNew(
    objectManager: ObjectManager,
    options: { noteId: string; fieldId: string },
  ) {
    return new TextToSpeechNoteFieldContent(
      {
        ...PersistableObject.create(),
        ...options,
        attachment: undefined,
      },
      objectManager,
    );
  }
}
