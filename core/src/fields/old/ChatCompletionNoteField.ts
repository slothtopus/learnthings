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
  GeneratedInlineNoteFieldContent,
} from "./GeneratedNoteField";
import { OpenAiChatCompletion } from "../generators/OpenAICompletion";


export type SerialisedChatCompletionNoteField = SerialisedNoteField & {
  sourceFieldId?: string;
  prompt?: string;
};

export class ChatCompletionNoteField extends GeneratedNoteField<ChatCompletionNoteFieldContent> {
  static doctype = "notefield";
  static subtype = "chat_completion";

  static createNew(
    objectManager: ObjectManager,
    {
      name,
      noteTypeId,
      sourceFieldId,
    }: { name: string; noteTypeId: string; sourceFieldId?: string },
  ) {
    return new ChatCompletionNoteField(
      {
        ...PersistableObject.create(),
        name,
        noteTypeId,
        sourceFieldId,
      },
      objectManager,
    );
  }

  static service?: OpenAiChatCompletion;

  sourceFieldId?: string;
  prompt?: string;

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
    serialised: SerialisedChatCompletionNoteField,
    objectManager: ObjectManager,
  ) {
    super(serialised, objectManager);
    const { sourceFieldId, prompt } = serialised;
    this.sourceFieldId = sourceFieldId;
    this.prompt = prompt;
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
    const content = ChatCompletionNoteFieldContent.createNew(
      this.objectManager,
      {
        noteId: note.id,
        fieldId: this.id,
      },
    );

    this.objectManager.setObject(content);

    return content;
  }

  async generate(note: Note) {
    const sourceText = this.getSourceContentOrThrow(note);
    if (this.prompt === undefined) {
      throw new Error("prompt is undefined");
    }
    try {
      this.isGenerating = true;

      if (ChatCompletionNoteField.service === undefined) {
        throw new Error("service is missing");
      }

      const content = await ChatCompletionNoteField.service.chatCompletion(
        this.prompt,
      );
      this.getOrCreateContent(note).setContent({
        sourceContent: { prompt: this.prompt, sourceText },
        content,
      });
    } finally {
      this.isGenerating = false;
    }
  }

  serialise(...args: Parameters<PersistableObject<any>["serialise"]>) {
    return {
      ...super.serialise(...args),
      sourceFieldId: this.sourceFieldId,
      prompt: this.prompt,
    };
  }

  setSource(id: string) {
    if (id !== this.sourceFieldId) {
      this.sourceFieldId = id;
      this.markDirty();
    }
  }

  setPrompt(prompt: string) {
    if (this.prompt !== prompt) {
      this.prompt = prompt;
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
          !isEqual(generatedContent?.sourceContent?.prompt, this.prompt))
      );
    } else {
      return false;
    }
  }
}

export class ChatCompletionNoteFieldContent extends GeneratedInlineNoteFieldContent<{
  prompt: string;
  sourceText: string;
}> {
  static doctype = "notefieldcontent";
  static subtype = "chat_completion";

  get field() {
    return super.field as unknown as ChatCompletionNoteField;
  }

  static createNew(
    objectManager: ObjectManager,
    options: { noteId: string; fieldId: string },
  ) {
    return new ChatCompletionNoteFieldContent(
      {
        ...PersistableObject.create(),
        ...options,
      },
      objectManager,
    );
  }
}
