import { cloneDeep, isEqual } from "lodash-es";
import { generateId } from "./utils/ids";
import type { ObjectQuery, ObjectType, ObjectManager } from "./ObjectManager";

import { pickBy } from "lodash-es";
import { AttachmentData } from "./utils/attachments";

export type PersistedObject = {
  _id: string;
  _meta: any;
  doctype: string;
  subtype: string;
  lastPersistedTimestamp: number | null;
  objects: any[];
};

const RESERVED_KEYS = [
  "_id",
  "_meta",
  "_attachments",
  "doctype",
  "subtype",
  "lastPersistedTimestamp",
  "objects",
] as const;
export type NoReservedKeys<T> = Omit<T, (typeof RESERVED_KEYS)[number]>;

export type PersistableObjectConstructor<
  T extends PersistableObject<S> = any,
  S extends PersistedObject = any,
  O = any
> = {
  createNewEmpty(objectManager: ObjectManager, options: O): T;
  new (serialised: S, objectManager: ObjectManager): T;
  doctype: string;
  subtype: string;
};

export class PersistableObject<S extends PersistedObject> {
  static create(id?: string): PersistedObject {
    return {
      _id: id || generateId(),
      _meta: null,
      lastPersistedTimestamp: null,
      objects: [],
      doctype: "base",
      subtype: "base",
    };
  }

  static filterReservedKeys<S extends PersistedObject>(s: S) {
    return pickBy(
      s,
      (v, k) => !RESERVED_KEYS.includes(k as any) && v !== undefined
    ) as NoReservedKeys<S>;
  }

  static doctype = "base";
  get doctype() {
    return (this.constructor as typeof PersistableObject<any>).doctype;
  }

  static subtype = "base";
  get subtype() {
    return (this.constructor as typeof PersistableObject<any>).subtype;
  }

  _id: string;
  get id() {
    return this._id;
  }

  get parentId() {
    return this.id;
  }

  get parentObj() {
    return this.objectManager.getObjectById(this.parentId);
  }

  get rootObj(): PersistableObject<any> {
    if (this.id !== this.parentId) {
      return this.parentObj.rootObj;
    } else {
      return this;
    }
  }

  get rootId(): string {
    return this.rootObj.id;
  }

  get relatedIds(): string[] {
    return [];
  }

  get deck() {
    return this.objectManager.getDeck();
  }

  _meta: any;
  getMeta() {
    return this._meta;
  }

  _lastPersisted: NoReservedKeys<S> | undefined;
  lastPersistedTimestamp: number | null;

  objectManager: ObjectManager;

  constructor(serialised: S, objectManager: ObjectManager) {
    this._id = serialised._id;
    this._meta = serialised._meta;
    this.lastPersistedTimestamp = serialised.lastPersistedTimestamp;
    this._lastPersisted = structuredClone(
      PersistableObject.filterReservedKeys(serialised)
    );
    this.objectManager = objectManager;
  }

  toString() {
    return `${this.doctype}:${this.id.slice(0, 3)}${this.id.slice(-3)}`;
  }

  matches({ include, exclude }: ObjectQuery, includeIfDeleted = false) {
    const includeMatches =
      include === undefined
        ? true
        : Object.entries(include).every(
            ([k, v]) => k in this && this[k as keyof typeof this] === v
          );
    const excludeMatches =
      exclude === undefined
        ? false
        : Object.entries(exclude).every(
            ([k, v]) => k in this && this[k as keyof typeof this] === v
          );

    return (
      includeMatches &&
      !excludeMatches &&
      // shouldDelete goes at the end for cases where an object may want to perform a query
      // within its own shouldDelete or isOrphaned methods. The matches can short circuit the
      // expression and ensure that an obj does not call its own shouldDelete
      (includeIfDeleted || !this.shouldDelete())
    );
  }

  isEmbedded() {
    return this.id !== this.parentId;
  }

  getEmbeddedIds(includeDeleted = false) {
    return this.getEmbeddedObjects(includeDeleted)
      .flatMap((o) => [o, ...o.getEmbeddedObjects(includeDeleted)])
      .map((o) => o.id);
  }

  _embeddedObjects: PersistableObject<PersistedObject>[] | undefined;
  getEmbeddedObjects(includeDeleted = false) {
    if (this._embeddedObjects === undefined) {
      //console.log("calculating embeddings for", this.id);
      this._embeddedObjects = this.objectManager.query(
        { include: { parentId: this.id }, exclude: { id: this.id } },
        includeDeleted
      );
    }
    return this._embeddedObjects;
  }

  handleEmbeddingsChanged() {
    this._embeddedObjects = undefined;
  }

  serialise(
    includeObjects = true,
    lastPersistedTimestamp?: number
  ): PersistedObject {
    return {
      _id: this.id,
      _meta: this._meta,
      lastPersistedTimestamp:
        lastPersistedTimestamp || this.lastPersistedTimestamp,
      doctype: this.doctype,
      subtype: this.subtype,
      objects: includeObjects
        ? this.getEmbeddedObjects().map((o) =>
            o.serialise(includeObjects, lastPersistedTimestamp)
          )
        : [],
    };
  }

  updateAfterPersist(_meta: any, lastPersistedTimestamp: number) {
    this._meta = _meta;
    this.flagShouldPersist(false);
    this.lastPersistedTimestamp = lastPersistedTimestamp;
    this._lastPersisted = cloneDeep(
      PersistableObject.filterReservedKeys(this.serialise(false) as S)
    );
    this.getEmbeddedObjects().forEach((o) =>
      o.updateAfterPersist(null, lastPersistedTimestamp)
    );
  }

  isOrphaned(): boolean {
    return this.relatedIds.some((id) => {
      const obj = this.objectManager.getObjectById(id);
      return obj === undefined || obj.shouldDelete();
    });
  }

  setUnsaved() {
    this._meta = null;
  }

  isUnsaved(): boolean {
    if (this.isEmbedded()) {
      return (
        this.lastPersistedTimestamp === null ||
        this.rootObj.lastPersistedTimestamp === null ||
        this.lastPersistedTimestamp < this.rootObj.lastPersistedTimestamp
      );
    } else {
      return this.lastPersistedTimestamp === null;
    }
  }

  _shouldDelete = false;
  flagShouldDelete(flag: boolean): void {
    this._shouldDelete = flag;
    if (flag) this.markDirty();
  }

  shouldDelete(): boolean {
    return this._shouldDelete || this.isOrphaned();
  }

  _shouldPersist = false;
  flagShouldPersist(flag: boolean): void {
    this._shouldPersist = flag;
    if (flag) this.markDirty();
  }

  hasChanged(): boolean {
    return !isEqual(
      this._lastPersisted,
      PersistableObject.filterReservedKeys(this.serialise(false))
    ); //||
    //this.getEmbeddedObjects(true).some((o) => o.hasChanged() || o.shouldDelete())
  }

  shouldPersistIfUnsaved = false;
  shouldPersist() {
    return (
      (this._shouldPersist ||
        (this.shouldPersistIfUnsaved && this.isUnsaved()) ||
        this.hasChanged()) &&
      !this.shouldDelete()
    );
  }

  markDirty(): void {
    this.objectManager.markDirtyIds(this.id);
  }

  markClean(): void {
    this.objectManager.dirtyIds.delete(this.id);
  }

  hasAttachment() {
    return false;
  }

  getAttachment(): AttachmentData | null {
    return null;
  }
}
