import {
  AttachmentNoteField,
  NoteFieldContent,
  SerialisedNoteFieldContent,
} from "./NoteField";

import { AttachmentDocument } from "../Attachment";
import type {
  SerialisedAttachmentDocument,
  SerialisedAttachmentMetaData,
} from "../Attachment";
import type { AttachmentData } from "../utils/attachments";
import { PersistableObject } from "../object_manager/PersistableObject";
import { ObjectManager } from "../object_manager/ObjectManager";

export type SerialisedAttachmentNoteFieldContent =
  SerialisedNoteFieldContent<SerialisedAttachmentMetaData | null>;

export class AttachmentNoteFieldContentV2 extends NoteFieldContent<
  AttachmentData,
  AttachmentNoteField,
  SerialisedAttachmentNoteFieldContent
> {
  constructor(
    serialised: SerialisedAttachmentNoteFieldContent,
    objectManager: ObjectManager,
  ) {
    super(serialised, objectManager);
    const {content} = serialised
    if(content !== null) {
        this._attachmentDoc = new AttachmentDocument(
      { ...PersistableObject.create(this.id), attachment: content },
      objectManager,
    );
    }
  }

  _attachmentDoc?: AttachmentDocument;
  setContent(attachment: AttachmentData) {
    const { data, ...attachmentData } = attachment;
    this._attachmentDoc = new AttachmentDocument(
      {
        ...PersistableObject.create(this.id),
        attachment: attachmentData,
      },
      this.objectManager,
    );
    this._attachmentDoc._data = data;
  }

  getAttachment(): AttachmentDocument | undefined {
    return this._attachmentDoc;
  }

  isEmpty() {
    return this._attachmentDoc === undefined;
  }

  serialiseContent() {
    return this._attachmentDoc?.attachment ?? null
  }

  serialise(
    ...args: Parameters<PersistableObject<any>["serialise"]>
  ): SerialisedAttachmentNoteFieldContent {
    return {
      ...super.serialise(...args),
      content: this.serialiseContent(),
      /*
        Maybe with a serialiseContent and a deserialiseContent methods?

      */
    };
  }
}

/*
  serialise(...args: Parameters<PersistableObject<any>["serialise"]>) {
    return {
      ...super.serialise(...args),
      attachment: this.attachment,
    };
  }
*/
