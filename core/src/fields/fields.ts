import {
  NoteField,
  AttachmentField,
  InlineFieldContent,
  AttachmentFieldContent,
} from "./base";

export class TextField extends NoteField<null, TextFieldContent> {
  static subtype = "text";
  protected get contentCtor() {
    return TextFieldContent;
  }
}
export class TextFieldContent extends InlineFieldContent<string> {
  static subtype = "text";
}

export class ImageAttachmentField extends AttachmentField<ImageAttachmentContent> {
  static defaultOptions = { mimetype: "image/*" };
  static subtype = "image";

  protected get contentCtor() {
    return ImageAttachmentContent;
  }
}
export class ImageAttachmentContent extends AttachmentFieldContent {
  static subtype = "image";
}

export class AudioAttachmentField extends AttachmentField<AudioAttachmentContent> {
  static defaultOptions = { mimetype: "audio/*" };
  static subtype = "audio";

  protected get contentCtor() {
    return AudioAttachmentContent;
  }
}
export class AudioAttachmentContent extends AttachmentFieldContent {
  static subtype = "audio";
}
