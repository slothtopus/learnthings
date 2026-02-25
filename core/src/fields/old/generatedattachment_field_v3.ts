import type { GeminiTtsRequestInput } from "../generators/GoogleTextToSpeech";
import { NoteField, NoteFieldContent } from "./notefield_v3";
import type { SerialisedNoteField } from "./notefield_v3";
import { PLACEHOLDER_BLOB } from "./attachment_field_v3";
import type { SerialisedAttachmentData } from "./attachment_field_v3";
import { AttachmentData } from "../utils/attachments";

import { omit } from "lodash-es";

export type GeminiTtsOptions = Pick<
  GeminiTtsRequestInput,
  "languageCode" | "voiceName"
>;

export type BaseGeneratedOptions = { sourceFieldId?: string };

export abstract class GeneratedAttachmentField<
  TContent extends GeneratedAttachmentFieldContent<any, any>,
  TOptions extends BaseGeneratedOptions,
> extends NoteField<TContent, TOptions, SerialisedNoteField<TOptions>> {
  abstract generate(): Promise<void>;
}



export type AttachmentDataWithMeta<TMeta> = AttachmentData & TMeta
export type SerialisedAttachmentDataWithMeta<TMeta> = Omit<AttachmentData, 'data'> & TMeta

export abstract class GeneratedAttachmentFieldContent<
  TField extends GeneratedAttachmentField<any, any>,
  TMeta,
> extends NoteFieldContent<
  TField,
  AttachmentDataWithMeta<TMeta>,
  SerialisedAttachmentDataWithMeta<TMeta>
> {
  serialiseContent(
    content: AttachmentDataWithMeta<TMeta>,
  ): SerialisedGeneratedAttachmentContent<TSourceContent> {
    return {
      ...content,
      attachment: omit(content.attachment, "data"),
    };
  }

  deserialiseContent(
    content: SerialisedGeneratedAttachmentContent<TSourceContent>,
  ): GeneratedAttachmentContent<TSourceContent> {
    return {
      sourceContent: content.sourceContent,
      attachment: { ...content.attachment, data: PLACEHOLDER_BLOB },
    };
  }

  async getContent() {
    if (this.content === null) {
      return null;
    }

    if (this.content.attachment.data === PLACEHOLDER_BLOB) {
      this.content.attachment.data = await this.objectManager.fetchAttachment(
        this.id,
      );
    }
    return this.content;
  }

  async getAttachmentContent() {
    const content = await this.getContent();
    return content?.attachment;
  }

  getSourceContent() {
    return this.content?.sourceContent;
  }

  hasAttachment(): boolean {
    return true;
  }

  getAttachment() {
    if (this.content && this.content.attachment.data !== PLACEHOLDER_BLOB) {
      return this.content;
    } else {
      return null;
    }
  }
}
