import { TextNoteField } from "./NoteField";
import type { SerialisedNoteField } from "./NoteField";
import type { Note } from "../Note";
import type { ObjectManager } from "../object_manager/ObjectManager";
import { PersistableObject } from "../object_manager/PersistableObject";
import { bufferToBlob } from "../utils/attachments";
import { GeminiTtsRequestInput } from "../generators/GoogleTextToSpeech";
import { isEqual } from "lodash-es";
import { GoogleTextToSpeech } from "../generators/GoogleTextToSpeech";
import {
  GeneratedNoteField,
  GeneratedAttachmentNoteFieldContent,
} from "./GeneratedNoteField";

export type GeminiTtsOptions = Pick<
  GeminiTtsRequestInput,
  "languageCode" | "voiceName"
>;

export type SerialisedTextToSpeechNoteField = SerialisedNoteField & {
  sourceFieldId?: string;
  options: GeminiTtsOptions;
};

export class TextToSpeechNoteField extends GeneratedNoteField<TextToSpeechNoteFieldContent> {
  static doctype = "notefield";
  static subtype = "text_to_speech";

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

  static service?: GoogleTextToSpeech;

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

      if (TextToSpeechNoteField.service === undefined) {
        throw new Error("service is missing");
      }

      const { audio } =
        await TextToSpeechNoteField.service.generateTextToSpeech({
          text: sourceText,
          languageCode: "af-ZA",
          voiceName: "Achird",
          ssml: false,
          audioEncoding: "MP3",
        });
        debugger
      const blob = bufferToBlob(audio, "audio/mpeg");
      const attachment = {
        filename: "generated.mp3",
        mimetype: "audio/mpeg",
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

export class TextToSpeechNoteFieldContent extends GeneratedAttachmentNoteFieldContent<{
  options: GeminiTtsOptions;
  sourceText: string;
}> {
  static doctype = "notefieldcontent";
  static subtype = "text_to_speech";

  get field() {
    return super.field as unknown as TextToSpeechNoteField;
  }

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
