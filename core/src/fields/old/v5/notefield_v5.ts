import { ObjectManager } from "../../object_manager/ObjectManager";
import {
  PersistableObject,
  PersistedObject,
} from "../../object_manager/PersistableObject";
import { Note } from "../../Note";
import { combineIds } from "../../utils/ids";
import type { NoteType } from "../../NoteType";
import { isEqual } from "lodash-es";


export type NoteContentStatic<
  TContentClass extends NoteFieldContent<TField, any, any, any[]>,
  TField extends NoteField<any, TContentClass, any, any>,
> = {
  new (
    serialised: SerialisedFieldContent,
    objectManager: ObjectManager,
  ): TContentClass;
};

type NoteFieldStatic<TOptions, TSelf> = (new (
  serialised: SerialisedNoteField<TOptions>,
  objectManager: ObjectManager,
) => TSelf) & {
  defaultOptions: TOptions;
};

export type SerialisedNoteField<TOptions> = {
  noteTypeId: string;
  name: string;
  options: TOptions;
} & PersistedObject;

export abstract class NoteField<
  TOptions,
  TContentClass extends NoteFieldContent<any, any, any, any[]>,
  TSerialised extends SerialisedNoteField<TOptions>,
  TSelf extends NoteField<TOptions, TContentClass, TSerialised, TSelf>,
> extends PersistableObject<TSerialised> {
  static doctype = "notefield";
  static subtype = "base";

  protected abstract get contentClass(): NoteContentStatic<
    TContentClass,
    TSelf
  >;
  static defaultOptions: any = null;

  shouldPersistIfUnsaved = true;
  name: string;
  options: TOptions;

  noteTypeId: string;
  get noteType() {
    return this.objectManager.getObjectById(this.noteTypeId) as NoteType;
  }

  get relatedIds() {
    return [this.noteTypeId];
  }

  get parentId() {
    return this.noteTypeId;
  }

  static createNew<
    TOptions,
    TContentClass extends NoteFieldContent<any, any, any, any[]>,
    TSerialised extends SerialisedNoteField<TOptions>,
    TSelf extends NoteField<TOptions, TContentClass, TSerialised, TSelf>,
  >(
    this: NoteFieldStatic<TOptions, TSelf>,
    objectManager: ObjectManager,
    { name, noteTypeId }: { name: string; noteTypeId: string },
  ): TSelf {
    return new this(
      {
        ...PersistableObject.create(),
        name,
        noteTypeId,
        options: this.defaultOptions,
      },
      objectManager,
    );
  }

  constructor(serialised: TSerialised, objectManager: ObjectManager) {
    super(serialised, objectManager);
    const { name, noteTypeId, options } = serialised;
    this.noteTypeId = noteTypeId;
    this.name = name;
    this.options = options;
  }

  serialise(
    ...args: Parameters<PersistableObject<any>["serialise"]>
  ): SerialisedNoteField<TOptions> {
    return {
      ...super.serialise(...args),
      noteTypeId: this.noteTypeId,
      name: this.name,
      options: this.options,
    };
  }

  contentFactory(note: Note) {
    return new this.contentClass(
      { ...PersistableObject.create(), noteId: note.id, fieldId: this.id },
      this.objectManager,
    );
  }

  getContent(note: Note): TContentClass | undefined {
    const content = this.objectManager.getObjectById(
      combineIds([note.id, this.id]),
    );
    return content as TContentClass | undefined;
  }

  getOrCreateContent(note: Note): TContentClass {
    return this.getContent(note) ?? this.contentFactory(note);
  }

  setName(name: string) {
    if (name !== this.name) {
      this.name = name;
      this.markDirty();
    }
  }

  setOptions(options: TOptions) {
    if (!isEqual(options, this.options)) {
      this.options = options;
      this.markDirty();
    }
  }

  delete() {
    this.flagShouldDelete(true);
    this.objectManager.markDirtyQuery({
      include: { doctype: "notefieldcontent", fieldId: this.id },
    });
    this.objectManager.markDirtyQuery({
      include: { doctype: "note", noteTypeId: this.noteTypeId },
    });
  }
}

type MaybePromise<T> = T | Promise<T>;

export type SerialisedFieldContent = PersistedObject & {
  noteId: string;
  fieldId: string;
};

export type SerialisedFieldContentBase = SerialisedFieldContent & {
  content?: unknown; // concrete subclasses narrow this via generics
};

export abstract class NoteFieldContent<
  TField extends NoteField<any, any, any, any>,
  TRuntime,
  TStored,
  TSetArgs extends any[] = [TRuntime],
> extends PersistableObject<SerialisedFieldContentBase> {
  static doctype = "notefieldcontent";
  static subtype = "base";

  noteId: string;
  fieldId: string;

  protected content?: TRuntime;

  get field(): TField {
    return this.objectManager.getObjectById(this.fieldId) as TField;
  }

  get id() {
    return combineIds([this.noteId, this.fieldId]);
  }

  constructor(
    serialised: SerialisedFieldContent & { content?: TStored },
    objectManager: ObjectManager,
  ) {
    super(serialised as any, objectManager);
    this.noteId = serialised.noteId;
    this.fieldId = serialised.fieldId;

    // ✅ deserialize at construction time
    this.content =
      serialised.content === undefined
        ? undefined
        : this.deserialiseContent(serialised.content);
  }

  /** Convert runtime -> stored */
  protected abstract serialiseContent(content: TRuntime): TStored;

  /** Convert stored -> runtime */
  protected abstract deserialiseContent(content: TStored): TRuntime;

  abstract setContent(...args: TSetArgs): void;

  /** Can be sync or async depending on content kind */
  abstract getContent(): MaybePromise<TRuntime | null>;

  abstract isEmpty(): boolean;

  serialise(...args: Parameters<PersistableObject<any>["serialise"]>) {
    return {
      ...super.serialise(...args),
      noteId: this.noteId,
      fieldId: this.fieldId,
      content:
        this.content === undefined
          ? undefined
          : this.serialiseContent(this.content),
    };
  }

  shouldDelete(): boolean {
    return super.shouldDelete() || this.isEmpty();
  }
}
