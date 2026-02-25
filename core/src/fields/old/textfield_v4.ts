import { NoteField, NoteFieldContent } from "./notefield_v4";
import type {
  SerialisedNoteField,
  SerialisedFieldContent,
} from "./notefield_v4";
import { PersistableObject } from "../object_manager/PersistableObject";
import { ObjectManager } from "../object_manager/ObjectManager";
import { Note } from "../Note";
import { NoteType } from "../NoteType";

export class InlineContentField<TContent, TOptions = null> extends NoteField<
  InlineFieldContent<TContent, any>,
  TOptions
> {
  static defaultOptions: TOptions;

  static createNew<TContent, TOptions = null>(
    objectManager: ObjectManager,
    { name, noteTypeId }: { name: string; noteTypeId: string },
  ) {
    return new InlineContentField<TContent, TOptions>(
      {
        ...PersistableObject.create(),
        name,
        noteTypeId,
        options: InlineContentField.defaultOptions,
      },
      objectManager,
    );
  }

  contentFactory(note: Note): InlineFieldContent<TContent, this> {
    return InlineFieldContent.createNew(this.objectManager, {
      noteId: note.id,
      fieldId: this.id,
    });
  }
}

export type SerialisedInlineFieldContent<TContent> = SerialisedFieldContent & {
  content: TContent | null;
};

export class InlineFieldContent<
  TContent,
  TField extends InlineContentField<TContent, any>,
> extends NoteFieldContent<TField> {
  static createNew<TContent, TField extends InlineContentField<TContent, any>>(
    objectManager: ObjectManager,
    options: { noteId: string; fieldId: string },
  ) {
    return new InlineFieldContent<TContent, TField>(
      {
        ...PersistableObject.create(),
        ...options,
        content: null,
      },
      objectManager,
    );
  }

  content: TContent | null;

  constructor(
    serialised: SerialisedInlineFieldContent<TContent>,
    objectManager: ObjectManager,
  ) {
    super(serialised, objectManager);
    const { content } = serialised;
    this.content = content;
  }

  getContent() {
    return this.content;
  }

  setContent(content: TContent) {
    this.content = content;
  }

  isEmpty() {
    return this.content === null;
  }
}

// ------------------ This is the pattern I would to be able to use

class TextField extends InlineContentField<string, null> {
  static defaultOptions = null;
}
class TextFieldContent extends InlineFieldContent<string, TextField> {}

class TimestampedTextField extends InlineContentField<
  { content: string; timestamp: string },
  { timeZone: string }
> {
  static defaultOptions = { timeZone: "UTC" };
}
class TimestampedTextFieldContent extends InlineFieldContent<
  { content: string; timestamp: string },
  TimestampedTextField
> {}
