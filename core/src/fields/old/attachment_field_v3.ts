import { NoteField, NoteFieldContent } from "./notefield_v3";
import { PersistableObject } from "../object_manager/PersistableObject";
import type { ObjectManager } from "../object_manager/ObjectManager";
import { areMimeTypesEqual } from "../utils/attachments";
import type { AttachmentData } from "../utils/attachments";
import { Note } from "../Note";

import { omit } from "lodash-es";

export type AttachmentFieldOptions = {
  mimetype: string;
};

export class AttachmentField extends NoteField<
  AttachmentFieldContent,
  AttachmentFieldOptions
> {
  static createNew(
    objectManager: ObjectManager,
    {
      name,
      noteTypeId,
      mimetype,
    }: { name: string; noteTypeId: string; mimetype: string },
  ) {
    return new AttachmentField(
      {
        ...PersistableObject.create(),
        name,
        noteTypeId,
        options: { mimetype },
      },
      objectManager,
    );
  }

  contentFactory(note: Note): AttachmentFieldContent {
    return AttachmentFieldContent.createNew(this.objectManager, {
      noteId: note.id,
      fieldId: this.id,
    });
  }
}

export type SerialisedAttachmentData = Omit<AttachmentData, "data"> & {
  data?: Blob;
};

export const PLACEHOLDER_BLOB = new Blob();

export class AttachmentFieldContent extends NoteFieldContent<
  AttachmentField,
  AttachmentData,
  SerialisedAttachmentData
> {
  static createNew(
    objectManager: ObjectManager,
    options: { noteId: string; fieldId: string },
  ) {
    return new AttachmentFieldContent(
      {
        ...PersistableObject.create(),
        ...options,
        content: null,
      },
      objectManager,
    );
  }

  setContent(attachmentData: AttachmentData) {
    if (
      !areMimeTypesEqual(this.field.options.mimetype, attachmentData.mimetype)
    ) {
      throw new Error(
        `Attachment mimetype ${attachmentData.mimetype} does not match field mimetype ${this.field.options.mimetype}`,
      );
    }
    this.content = attachmentData;
    this.markDirty();
  }

  serialiseContent(content: AttachmentData): SerialisedAttachmentData {
    return omit(content, "data");
  }

  deserialiseContent(content: SerialisedAttachmentData): AttachmentData {
    return { ...content, data: PLACEHOLDER_BLOB };
  }

  async getContent() {
    if (this.content === null) {
      return null;
    }

    if (this.content.data === PLACEHOLDER_BLOB) {
      this.content.data = await this.objectManager.fetchAttachment(this.id);
    }
    return this.content;
  }

  hasAttachment(): boolean {
    return true;
  }

  getAttachment() {
    if (this.content && this.content.data !== PLACEHOLDER_BLOB) {
      return this.content;
    } else {
      return null;
    }
  }
}
