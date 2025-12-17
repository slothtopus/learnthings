import { PersistableObject, PersistedObject } from "./PersistableObject";
import type { ObjectManager } from "./ObjectManager";
import type { AttachmentData } from "./utils/attachments";

export type SerialisedAttachmentData = {
  filename: string;
  mimetype: string;
  url?: string;
};

export type SerialisedAttachmentDocument = PersistedObject & {
  attachment: SerialisedAttachmentData;
};

export class AttachmentDocument extends PersistableObject<SerialisedAttachmentDocument> {
  static doctype = "attachment";
  static subtype = "attachment";

  attachment: SerialisedAttachmentData;
  _data?: Blob;

  constructor(
    serialised: SerialisedAttachmentDocument,
    objectManager: ObjectManager
  ) {
    super(serialised, objectManager);
    const { attachment } = serialised;
    this.attachment = attachment;
  }

  serialise(...args: Parameters<PersistableObject<any>["serialise"]>) {
    return {
      ...super.serialise(...args),
      attachment: this.attachment,
    };
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
    if (this._data === undefined) {
      this._data = await this.objectManager.fetchAttachment(this.id);
    }
    return this.getAttachment();
  }

  _objectURL: undefined | string;
  async getObjectURL() {
    if (this._objectURL === undefined) {
      const attachment = await this.fetchAttachment();
      if (attachment !== null) {
        this._objectURL = URL.createObjectURL(attachment.data);
      }
    }
    return this._objectURL;
  }
}
