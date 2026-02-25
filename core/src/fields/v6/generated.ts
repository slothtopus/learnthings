import {
  GeneratedAttachmentField,
  GeneratedAttachmentFieldContent,
} from "./base";
import { TextField } from "./fields";

import { Note } from "../../Note";

import { GeminiTtsRequestInput } from "../../generators/GoogleTextToSpeech";
import { GoogleTextToSpeech } from "../../generators/GoogleTextToSpeech";
import { bufferToBlob } from "../../utils/attachments";

import { omit, isEqual } from "lodash-es";

export type GeminiTtsOptions = Pick<
  GeminiTtsRequestInput,
  "languageCode" | "voiceName"
>;

export type TextToSpeechOptions = GeminiTtsOptions & { sourceFieldId?: string };

export type TextToSpeechSourceContent = {
  options: GeminiTtsOptions;
  sourceText: string;
};

export class TextToSpeechField extends GeneratedAttachmentField<
  TextToSpeechOptions,
  TextToSpeechSourceContent
> {
  static subtype = "text_to_speech";
  static service?: GoogleTextToSpeech;
  static defaultOptions = {
    languageCode: "en-GB",
    voiceName: "Achernar",
  };

  protected get contentCtor() {
    return TextToSpeechFieldContent;
  }

  getSourceTextOrThrow(note: Note) {
    if (this.options.sourceFieldId === undefined) {
      throw new Error("Source field not set");
    }
    const sourceField = this.objectManager.getObjectById(
      this.options.sourceFieldId,
    );
    if (!(sourceField instanceof TextField)) {
      throw new Error(`Source field ${sourceField} must be TextField`);
    }
    const sourceContent = sourceField.getContent(note)?.getContent();
    if (sourceContent?.trim()) {
      return sourceContent;
    }
    throw new Error(`Cannot generate from text content: ${sourceContent}`);
  }

  async generate(note: Note) {
    const sourceText = this.getSourceTextOrThrow(note);
    try {
      this.isGenerating = true;

      if (TextToSpeechField.service === undefined) {
        throw new Error("service is missing");
      }

      const { audio } = await TextToSpeechField.service.generateTextToSpeech({
        text: sourceText,
        languageCode: "af-ZA",
        voiceName: "Achird",
        ssml: false,
        audioEncoding: "MP3",
      });
      const blob = bufferToBlob(audio, "audio/mpeg");
      const attachment = {
        filename: "generated.mp3",
        mimetype: "audio/mpeg",
        data: blob,
      };
      this.getOrCreateContent(note).setContent({
        attachment,
        source: { options: omit(this.options, "sourceFieldId"), sourceText },
      });
    } finally {
      this.isGenerating = false;
    }
  }

  canGenerate(note: Note) {
    try {
      this.getSourceTextOrThrow(note);
      return true;
    } catch {
      return false;
    }
  }

  shouldGenerate(note: Note) {
    try {
      const sourceText = this.getSourceTextOrThrow(note);
      const generatedContent = this.getContent(note);
      if (generatedContent === undefined || generatedContent.isEmpty()) {
        return true;
      } else {
        return !isEqual(
          { options: omit(this.options, "sourceFieldId"), sourceText },
          generatedContent.getSource(),
        );
      }
    } catch {
      return false;
    }
  }
}

export class TextToSpeechFieldContent extends GeneratedAttachmentFieldContent<TextToSpeechSourceContent> {}
