import { areMimeTypesEqual } from "../../utils/attachments";
import type { AttachmentData } from "../../utils/attachments";
import { ObjectManager } from "../../object_manager/ObjectManager";
import { PersistableObject } from "../../object_manager/PersistableObject";
import { NoteField, NoteFieldContent } from "./notefield_v5";
import type {
  SerialisedNoteField,
  SerialisedFieldContent,
} from "./notefield_v5";
import { Note } from "../../Note";

import { omit } from "lodash-es";

export type SerialisedAttachmentData = Omit<AttachmentData, "data"> & {
  data?: Blob;
};

export const PLACEHOLDER_BLOB = new Blob();

export abstract class AttachmentContentCommon<
  TField extends NoteField<any, any, any, any>,
> extends NoteFieldContent<
  TField,
  AttachmentData,
  SerialisedAttachmentData,
  any
> {
  static subtype = "attachment";

  protected serialiseContent(
    content: AttachmentData,
  ): SerialisedAttachmentData {
    return omit(content, "data");
  }

  protected deserialiseContent(
    content: SerialisedAttachmentData,
  ): AttachmentData {
    return { ...content, data: PLACEHOLDER_BLOB };
  }

  async getContent() {
    if (this.content === undefined) return null;
    if (this.content.data === PLACEHOLDER_BLOB) {
      this.content.data = await this.objectManager.fetchAttachment(this.id);
    }
    return this.content;
  }

  isEmpty() {
    return this.content === null;
  }

  hasAttachment(): boolean {
    return true;
  }

  getAttachment() {
    return this.content && this.content.data !== PLACEHOLDER_BLOB
      ? this.content
      : null;
  }
}

export type AttachmentFieldOptions = { mimetype: string };

export abstract class AttachmentField<
  TContentClass extends AttachmentFieldContent<TSelf>,
  TSelf extends AttachmentField<TContentClass, TSelf>,
> extends NoteField<
  AttachmentFieldOptions,
  TContentClass,
  SerialisedNoteField<AttachmentFieldOptions>,
  TSelf
> {
  static defaultOptions: AttachmentFieldOptions = {
    mimetype: "application/octet-stream",
  };
}

export class AttachmentFieldContent<
  TField extends AttachmentField<any, any>,
> extends AttachmentContentCommon<TField> {
  setContent(attachmentData: AttachmentData) {
    if (
      !areMimeTypesEqual(this.field.options.mimetype, attachmentData.mimetype)
    ) {
      throw new Error(`...`);
    }
    this.content = attachmentData;
    this.markDirty();
  }
}

export abstract class GeneratedAttachmentField<
  TOptions,
  TContent extends GeneratedAttachmentFieldContent<any, any>,
  TSelf extends GeneratedAttachmentField<TOptions, TContent, TSelf>,
> extends NoteField<TOptions, TContent, SerialisedNoteField<TOptions>, TSelf> {}

export type SerialisedGeneratedAttachmentFieldContent<TSource> =
  SerialisedFieldContent & {
    content?: SerialisedAttachmentData;
    sourceContent?: TSource;
  };

export class GeneratedAttachmentFieldContent<
  TField extends GeneratedAttachmentField<any, any, any>,
  TSource,
> extends AttachmentContentCommon<TField> {
  sourceContent?: TSource;

  constructor(
    serialised: SerialisedGeneratedAttachmentFieldContent<TSource>,
    om: ObjectManager,
  ) {
    super(serialised, om);
    this.sourceContent = serialised.sourceContent;
  }

  setContent(attachmentData: AttachmentData, sourceContent: TSource) {
    this.content = attachmentData;
    this.sourceContent = sourceContent;
    this.markDirty();
  }

  serialise(
    ...args: Parameters<PersistableObject<any>["serialise"]>
  ) {
    return { ...super.serialise(...args), sourceContent: this.sourceContent };
  }

  getSourceContent() {
    return this.sourceContent
  }
}

// ------------ Implementations ---------------

export class ImageAttachmentField extends AttachmentField<
  ImageAttachmentContent,
  ImageAttachmentField
> {
  static defaultOptions = { mimetype: "image/*" };

  protected get contentClass() {
    return ImageAttachmentContent;
  }
}

export class ImageAttachmentContent extends AttachmentFieldContent<ImageAttachmentField> {}



const om = new ObjectManager();
const field = ImageAttachmentField.createNew(om, {
  name: "test",
  noteTypeId: "123",
});
const note = Note.createNew(om, { noteTypeId: "123" });
const content = field.getOrCreateContent(note);




export class TextToSpeechField extends GeneratedAttachmentField<
  { voice: string, sourceFieldId: string },
  TextToSpeechFieldContent,
  TextToSpeechField
> {
  static defaultOptions = { voice: "arnold", sourceFieldId: "123" };

  protected get contentClass() {
    return TextToSpeechFieldContent;
  }

  async generate(note: Note) {
    const sourceField = this.objectManager.getObjectById(this.options.sourceFieldId) as TextField
    const sourceContent = sourceField.getOrCreateContent(note).getContent()
    const generatedContent: AttachmentData = await generateSomeSpeech(this.options.voice, sourceContent)
    this.getOrCreateContent(note).setContent(generatedContent, {voice: this.options.voice, sourceText: sourceContent})
  }
}

export class TextToSpeechFieldContent extends GeneratedAttachmentFieldContent<
  TextToSpeechField,
  { voice: string, sourceText: string }
> {}



const tfield = TextToSpeechField.createNew(om, {
  name: "test",
  noteTypeId: "123",
});
// content is typed as AttachmentFieldContent. I want this to be typed as ImageAttachmentContent
const tcontent = tfield.getOrCreateContent(note);

const dummy = 123

tcontent.setContent(dummy as unknown as AttachmentData, {sourceText: 'hello'})
const serialised = tcontent.serialise()
const attachment = tcontent.getContent()
const sourceContent = tcontent.getSourceContent()