import { PersistableObject } from "../object_manager/PersistableObject";
import type { PersistedObject } from "../object_manager/PersistableObject";
import type { ObjectManager } from "../object_manager/ObjectManager";

import type { NoteType } from "../NoteType";
import type { Note } from "../Note";

import { combineIds } from "../utils/ids";
import { areMimeTypesEqual } from "../utils/attachments";
import type { AttachmentData } from "../utils/attachments";

import { isEqual, omit } from "lodash-es";

type MaybePromise<T> = T | Promise<T>;

/** Your existing shapes (kept as-is) */
export type SerialisedNoteField<TOptions> = {
  noteTypeId: string;
  name: string;
  options: TOptions;
} & PersistedObject;

/**
 * Base stored payload shape for all content objects.
 * Concrete content types narrow `stored` & optionally add `source`.
 */
export type SerialisedFieldContent<TStored = unknown, TSource = unknown> = {
  noteId: string;
  fieldId: string;
  content?: TStored;
  source?: TSource;
} & PersistedObject;

export type ContentCtor<TContent extends NoteFieldContent<any, any, any>> =
  new (
    serialised: SerialisedFieldContent<any, any>,
    objectManager: ObjectManager,
  ) => TContent;

/** ========================================================================== *
 *  NOTE FIELD (base)
 * ========================================================================== */

type NoteFieldStatic<TOptions, TSelf> = (new (
  serialised: SerialisedNoteField<TOptions>,
  objectManager: ObjectManager,
) => TSelf) & {
  defaultOptions: TOptions;
};

export abstract class NoteField<
  TOptions,
  TContent extends NoteFieldContent<any, any, any>,
  TSerialised extends SerialisedNoteField<TOptions> =
    SerialisedNoteField<TOptions>,
> extends PersistableObject<TSerialised> {
  static doctype = "notefield";
  static subtype = "base";
  static defaultOptions: any = null;

  /** Concrete fields override this with `return SomeContentClass` */
  protected abstract get contentCtor(): ContentCtor<TContent>;

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

  static createNew<TOptions, TSelf extends NoteField<TOptions, any, any>>(
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
      } as any,
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

  /** Create a new content instance for a given note */
  contentFactory(note: Note): TContent {
    return new this.contentCtor(
      {
        ...PersistableObject.create(),
        noteId: note.id,
        fieldId: this.id,
      },
      this.objectManager,
    );
  }

  getContent(note: Note): TContent | undefined {
    const content = this.objectManager.getObjectById(
      combineIds([note.id, this.id]),
    );
    return content as TContent | undefined;
  }

  getOrCreateContent(note: Note): TContent {
    let content = this.getContent(note);
    if (content === undefined) {
      content = this.contentFactory(note);
      return this.objectManager.setObject(content);
    } else {
      return content;
    }
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

export type AnyNoteField = NoteField<any, any, any>;

/** ========================================================================== *
 *  NOTE FIELD CONTENT (base)
 *
 *  TRuntime  - in-memory runtime form
 *  TStored   - persisted form under `content`
 *  TSet      - payload type accepted by setContent()
 *  TSource   - optional persisted “source metadata” under `source`
 * ========================================================================== */

export abstract class NoteFieldContent<
  TRuntime,
  TStored,
  TSet,
  TSource = undefined,
> extends PersistableObject<SerialisedFieldContent<TStored, TSource>> {
  static doctype = "notefieldcontent";
  static subtype = "base";

  noteId: string;
  fieldId: string;

  /** Empty is represented internally as `undefined` */
  protected content?: TRuntime;

  /** Optional source metadata (sync-access) */
  protected source?: TSource;

  /** Generic, non-circular field accessor (override or cast in subclasses if needed) */
  get field(): NoteField<any, any, any> {
    return this.objectManager.getObjectById(this.fieldId) as any;
  }

  get id() {
    return combineIds([this.noteId, this.fieldId]);
  }

  get parentId() {
    return this.noteId;
  }

  constructor(
    serialised: SerialisedFieldContent<TStored, TSource>,
    objectManager: ObjectManager,
  ) {
    super(serialised as any, objectManager);

    this.noteId = serialised.noteId;
    this.fieldId = serialised.fieldId;

    this.content =
      serialised.content === undefined
        ? undefined
        : this.deserialiseContent(serialised.content);

    this.source = serialised.source;
  }

  /** Convert runtime -> stored */
  protected abstract serialiseContent(content: TRuntime): TStored;

  /** Convert stored -> runtime */
  protected abstract deserialiseContent(content: TStored): TRuntime;

  /** Payload-based setter (no tuple generics) */
  abstract setContent(payload: TSet): void;

  /** Can be sync or async depending on content kind */
  abstract getContent(): MaybePromise<TRuntime | null>;

  /** Default empty definition: no runtime content */
  isEmpty(): boolean {
    return this.content === undefined;
  }

  /** Optional sync getter for source metadata */
  getSource(): TSource | undefined {
    return this.source;
  }

  serialise(...args: Parameters<PersistableObject<any>["serialise"]>) {
    const base = {
      ...super.serialise(...args),
      noteId: this.noteId,
      fieldId: this.fieldId,
      content:
        this.content === undefined
          ? undefined
          : this.serialiseContent(this.content),
    } as SerialisedFieldContent<TStored, TSource>;

    // Only include if present to keep JSON clean
    if (this.source !== undefined) {
      base.source = this.source;
    }

    return base;
  }

  shouldDelete(): boolean {
    return super.shouldDelete() || this.isEmpty();
  }

  markDirty() {
    super.markDirty();
    this.objectManager.getObjectById(this.noteId).markDirty();
  }

  resetToLastPersisted() {
    if (this._lastPersisted) {
      this.noteId = this._lastPersisted.noteId;
      this.fieldId = this._lastPersisted.fieldId;
      this.content =
        this._lastPersisted.content === undefined
          ? undefined
          : this.deserialiseContent(this._lastPersisted.content);
      this.source = this._lastPersisted.source;
    }
  }
}

export type AnyNoteFieldContent = NoteFieldContent<any, any, any, any>;

/** ========================================================================== *
 *  INLINE CONTENT (simple serialisable)
 * ========================================================================== */

export class InlineFieldContent<T> extends NoteFieldContent<T, T, T> {
  static subtype = "inline";

  protected serialiseContent(content: T): T {
    return content;
  }

  protected deserialiseContent(content: T): T {
    return content;
  }

  setContent(content: T) {
    if (!isEqual(content, this.content)) {
      this.content = content;
      this.markDirty();
    }
  }

  getContent() {
    return this.content ?? null;
  }
}

/** ========================================================================== *
 *  GENERATED INLINE CONTENT (inline + source metadata)
 * ========================================================================== */

export type GeneratedInlineSet<TContent, TSource> = {
  content: TContent;
  source: TSource;
};

export class GeneratedInlineFieldContent<
  TContent,
  TSource,
> extends NoteFieldContent<
  TContent,
  TContent,
  GeneratedInlineSet<TContent, TSource>,
  TSource
> {
  protected serialiseContent(content: TContent): TContent {
    return content;
  }

  protected deserialiseContent(content: TContent): TContent {
    return content;
  }

  setContent({ content, source }: GeneratedInlineSet<TContent, TSource>) {
    this.content = content;
    this.source = source;
    this.markDirty();
  }

  getContent() {
    return this.content ?? null;
  }
}

/** ========================================================================== *
 *  GENERATED FIELD (field-side hook)
 * ========================================================================== */

export abstract class GeneratedField<
  TOptions,
  TContent extends NoteFieldContent<any, any, any, any>,
> extends NoteField<TOptions, TContent> {
  isGenerating = false;
  abstract generate(note: Note): Promise<void>;
  abstract canGenerate(note: Note): boolean;
  abstract shouldGenerate(note: Note): boolean;
}

/** ========================================================================== *
 *  ATTACHMENTS
 * ========================================================================== */

export type SerialisedAttachmentData = Omit<AttachmentData, "data"> & {
  data?: Blob;
};

export const PLACEHOLDER_BLOB = new Blob();

/** Attachments set payload */
export type AttachmentSet = { attachment: AttachmentData };

/** Attachments + source metadata set payload */
export type GeneratedAttachmentSet<TSource> = {
  attachment: AttachmentData;
  source: TSource;
};

export abstract class AttachmentContentCommon<
  TSet,
  TSource = undefined,
> extends NoteFieldContent<
  AttachmentData,
  SerialisedAttachmentData,
  TSet,
  TSource
> {
  static subtype = "generated_attachment";

  get parentId() {
    return this.id;
  }

  protected serialiseContent(
    content: AttachmentData,
  ): SerialisedAttachmentData {
    return omit(content, "data");
  }

  protected deserialiseContent(
    content: SerialisedAttachmentData,
  ): AttachmentData {
    return { ...content, data: PLACEHOLDER_BLOB };
  }

  async getContent() {
    if (this.content === undefined) return null;

    if (this.content.data === PLACEHOLDER_BLOB) {
      this.content.data = await this.objectManager.fetchAttachment(this.id);
    }

    return this.content;
  }

  // Stash the Blob here after persist so we can reset back to it because it is
  // not included in the serialised data
  _lastPersistedBlob: Blob = PLACEHOLDER_BLOB;
  updateAfterPersist(
    ...args: Parameters<PersistableObject<any>["updateAfterPersist"]>
  ) {
    super.updateAfterPersist(...args);
    this._lastPersistedBlob = this.content?.data ?? PLACEHOLDER_BLOB;
  }

  resetToLastPersisted(): void {
    super.resetToLastPersisted();
    if (this.content) {
      this.content.data = this._lastPersistedBlob;
    }
  }

  hasAttachment(): boolean {
    return true;
  }

  /** Sync “do we already have the blob?” accessor */
  getAttachment() {
    return this.content && this.content.data !== PLACEHOLDER_BLOB
      ? this.content
      : null;
  }
}

/** Field type for attachment options */
export type AttachmentFieldOptions = { mimetype: string };

export abstract class AttachmentField<
  TContent extends NoteFieldContent<any, any, any, any>,
> extends NoteField<AttachmentFieldOptions, TContent> {
  static defaultOptions: AttachmentFieldOptions = {
    mimetype: "application/octet-stream",
  };
}

/** Non-generated attachment content */
export class AttachmentFieldContent extends AttachmentContentCommon<AttachmentSet> {
  setContent({ attachment }: AttachmentSet) {
    const field = this.field as AttachmentField<any>;

    if (!areMimeTypesEqual(field.options.mimetype, attachment.mimetype)) {
      throw new Error(`...`);
    }

    this.content = attachment;
    this.markDirty();
  }
}

/** Generated attachment content (attachments + source metadata) */
export class GeneratedAttachmentFieldContent<
  TSource,
> extends AttachmentContentCommon<GeneratedAttachmentSet<TSource>, TSource> {
  setContent({ attachment, source }: GeneratedAttachmentSet<TSource>) {
    this.content = attachment;
    this.source = source;
    this.markDirty();
  }
}

/** Field-side hook for “generated attachments” */
export abstract class GeneratedAttachmentField<
  TOptions,
  TSource,
> extends GeneratedField<TOptions, GeneratedAttachmentFieldContent<TSource>> {}
