import { NoteField, NoteFieldContent } from "./notefield_v3";
import { PersistableObject } from "../object_manager/PersistableObject";
import type { ObjectManager } from "../object_manager/ObjectManager";
import { Note } from "../Note";

export class TextField extends NoteField<TextFieldContent, null> {
  static createNew(
    objectManager: ObjectManager,
    { name, noteTypeId }: { name: string; noteTypeId: string },
  ) {
    return new TextField(
      {
        ...PersistableObject.create(),
        name,
        noteTypeId,
        options: null
      },
      objectManager,
    );
  }

  getDefaultOptions(): null {
    return null;
  }

  contentFactory(note: Note): TextFieldContent {
    return TextFieldContent.createNew(this.objectManager, {
      noteId: note.id,
      fieldId: this.id,
    });
  }
}

export class TextFieldContent extends NoteFieldContent<TextField, string> {
  static createNew(
    objectManager: ObjectManager,
    options: { noteId: string; fieldId: string },
  ) {
    return new TextFieldContent(
      {
        ...PersistableObject.create(),
        ...options,
        content: null,
      },
      objectManager,
    );
  }
}
