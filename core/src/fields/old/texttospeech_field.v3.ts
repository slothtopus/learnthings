import {
  GeneratedAttachmentField,
  GeneratedAttachmentFieldContent,
} from "./generatedattachment_field_v3";
import type { GeminiTtsRequestInput } from "../generators/GoogleTextToSpeech";
import type { ObjectManager } from "../object_manager/ObjectManager";
import { PersistableObject } from "../object_manager/PersistableObject";
import { Note } from "../Note";

export type TextToSpeechFieldOptions = Pick<
  GeminiTtsRequestInput,
  "languageCode" | "voiceName"
> & { sourceFieldId?: string };

export class TextToSpeechField extends GeneratedAttachmentField<
  TextToSpeechFieldContent,
  TextToSpeechFieldOptions
> {
  async generate() {
    return;
  }

  contentFactory(note: Note): GeneratedAttachmentFieldContent<any, any> {
    return TextToSpeechFieldContent.createNew(this.objectManager, {
      noteId: note.id,
      fieldId: this.id,
    });
  }
}

export class TextToSpeechFieldContent extends GeneratedAttachmentFieldContent<
  TextToSpeechField,
  { sourceText: string }
> {
  static createNew(
    objectManager: ObjectManager,
    options: { noteId: string; fieldId: string },
  ) {
    return new TextToSpeechFieldContent(
      {
        ...PersistableObject.create(),
        ...options,
        content: null,
      },
      objectManager,
    );
  }
}



