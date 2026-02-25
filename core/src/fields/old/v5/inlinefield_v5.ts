import { ObjectManager } from "../../object_manager/ObjectManager";
import { PersistableObject } from "../../object_manager/PersistableObject";
import { Note } from "../../Note";
import { isEqual } from "lodash-es";

import { NoteField, NoteFieldContent } from "./notefield_v5";
import type {
  SerialisedNoteField,
  SerialisedFieldContent,
} from "./notefield_v5";

export type SerialisedInlineFieldContent<TContent> = SerialisedFieldContent & {
  content?: TContent;
};

export class InlineFieldContent<
  TContent,
  TField extends NoteField<any, any, any, any>,
  TSelf extends InlineFieldContent<TContent, TField, TSelf>,
> extends NoteFieldContent<TField, TContent, TContent, [TContent]> {
  static subtype = "inline";

  protected serialiseContent(content: TContent): TContent {
    return content;
  }

  protected deserialiseContent(content: TContent): TContent {
    return content;
  }

  setContent(content: TContent) {
    if (!isEqual(content, this.content)) {
      this.content = content;
      this.markDirty();
    }
  }

  getContent() {
    return this.content ?? null;
  }

  isEmpty() {
    return this.content === null;
  }
}

export abstract class GeneratedInlineField<
  TOptions,
  TContentClass extends GeneratedInlineFieldContent<any, any, TSelf, any>,
  TSelf extends GeneratedInlineField<TOptions, TContentClass, TSelf>,
> extends NoteField<
  TOptions,
  TContentClass,
  SerialisedNoteField<TOptions>,
  TSelf
> {
  abstract generate(note: Note): Promise<void>
}

export type SerialisedGeneratedInlineFieldContent<TContent, TSource> =
  SerialisedInlineFieldContent<TContent> & { sourceContent?: TSource };

export class GeneratedInlineFieldContent<
  TContent,
  TSource,
  TField extends NoteField<any, any, any, any>,
  TSelf extends GeneratedInlineFieldContent<TContent, TSource, TField, TSelf>,
> extends NoteFieldContent<TField, TContent, TContent, [TContent, TSource]> {
  sourceContent?: TSource;

  constructor(
    serialised: SerialisedGeneratedInlineFieldContent<TContent, TSource>,
    om: ObjectManager,
  ) {
    super(serialised, om);
    this.sourceContent = serialised.sourceContent;
  }

  protected serialiseContent(content: TContent): TContent {
    return content;
  }

  protected deserialiseContent(content: TContent): TContent {
    return content;
  }

  setContent(content: TContent, sourceContent: TSource) {
    this.content = content;
    this.sourceContent = sourceContent;
    this.markDirty();
  }

  getContent() {
    return this.content ?? null;
  }

  getSourceContent() {
    return this.sourceContent;
  }

  isEmpty() {
    return this.content === null;
  }
}

class TextField extends NoteField<
  null,
  TextFieldContent,
  SerialisedNoteField<null>,
  TextField
> {
  protected get contentClass() {
    return TextFieldContent;
  }
}
class TextFieldContent extends InlineFieldContent<
  string,
  TextField,
  TextFieldContent
> {}

const om = new ObjectManager();
const field = TextField.createNew(om, { name: "test", noteTypeId: "123" });
field.setOptions(null);
const note = Note.createNew(om, { noteTypeId: "123" });
const content = field.getOrCreateContent(note);
const innerContent = content.getContent();
//content.setContent(342)

content.field.options;

class LLMGeneratedTextField extends GeneratedInlineField<
  { prompt: string, sourceFieldId: string },
  GeneratedTextFieldContent,
  LLMGeneratedTextField
> {
  static defaultOptions = { prompt: "Write a joke", sourceFieldId: "123" };
  protected get contentClass() {
    return GeneratedTextFieldContent;
  }

  async generate(note: Note) {
    const sourceField = this.objectManager.getObjectById(this.options.sourceFieldId) as TextField
    const sourceContent = sourceField.getOrCreateContent(note).getContent()
    const generatedContent: string = await useLLMtoGenerateSomeContent(this.options.prompt, sourceContent)
    this.getOrCreateContent(note).setContent(generatedContent, {prompt: this.options.prompt, sourceContent: generatedContent})
  }
}

class GeneratedTextFieldContent extends GeneratedInlineFieldContent<
  string,
  { prompt: string, sourceContent: string },
  LLMGeneratedTextField,
  GeneratedTextFieldContent
> {}

const LLMField = LLMGeneratedTextField.createNew(om, {
  name: "test",
  noteTypeId: "123",
});
const LLMContent = LLMField.getOrCreateContent(note);
LLMContent.setContent('test', {prompt: 'tdgfdgsf'})
const source = LLMContent.getSourceContent()
const con = LLMContent.getContent()
