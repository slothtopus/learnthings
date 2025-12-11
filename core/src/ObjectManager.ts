import { PersistableObject, PersistedObject } from "./PersistableObject";
import {
  getOrCreateLocalDeckDB,
  pouchSerialise,
  pouchDeserialise,
} from "./service/PouchDB";
import type { PouchSerialisedSaved } from "./service/PouchDB";
import type { PersistableObjectConstructor } from "./PersistableObject";

import { isNode } from "browser-or-node";
import { blobToBuffer, bufferToBlob } from "./utils/attachments";
import { Deck } from "./Deck";
import { isEqual, pick, cloneDeep } from "lodash-es";

import { TransactionGraphV4 } from "./TransactionGraph";

export type ObjectType = {
  doctype: string;
  subtype: string;
};

export type ObjectQuery = {
  include?: Record<string, string>;
  exclude?: Record<string, string>;
};

export type OrderedObjectOperation = {
  obj: PersistableObject<any>;
  order: number;
  operation: "persist" | "delete";
};

export class ObjectManager {
  deckId: string;
  //_dbPromise: ReturnType<typeof getOrCreateLocalDeckDB>;
  db: Awaited<ReturnType<typeof getOrCreateLocalDeckDB>> | undefined;
  registry: Record<string, PersistableObjectConstructor> = {};
  objectsById: Record<string, PersistableObject<PersistedObject>> = {};

  dirtyIds = new Set<string>();

  /*
  _version = 0;
  get version() {
    return this._version;
  }
  set version(v: number) {
    this._version = v;
  }*/

  version: Record<string, number> = { default: 0 };

  static generateObjectKey({
    doctype,
    subtype,
  }: {
    doctype: string;
    subtype: string;
  }) {
    return `${doctype}:${subtype}`;
  }

  constructor(deckId: string) {
    this.deckId = deckId;
  }

  applyObject(obj: PersistableObject<any>) {
    this.objectsById[obj.id] = obj;
    this.updateEmbeddings(obj);
    this.updateVersion(obj.doctype);
  }

  updateVersion(doctype: string) {
    if (doctype in this.version) {
      this.version[doctype] += 1;
    } else {
      this.version[doctype] = 0;
    }
    this.version["default"] += 1;
  }

  deleteObject(obj: PersistableObject<any>) {
    this.updateEmbeddings(obj);
    delete this.objectsById[obj.id];
    this.updateVersion(obj.doctype);
  }

  getObjectById(id: string) {
    return this.objectsById[id];
  }

  getAllObjects() {
    return Object.values(this.objectsById);
  }

  resetObjects() {
    this.objectsById = {};
  }

  updateEmbeddings(obj: PersistableObject<any>) {
    if (obj.isEmbedded() && obj.parentObj) {
      obj.parentObj.handleEmbeddingsChanged();
    }
  }

  updateObjectAfterPersist(
    id: string,
    meta: any,
    lastPersistedTimestamp: number
  ) {
    //console.log("updateObjectAfterPersist", id, meta, lastPersistedTimestamp);
    this.getObjectById(id).updateAfterPersist(meta, lastPersistedTimestamp);
  }

  getDB() {
    if (this.db === undefined) {
      throw new Error("Not initialised");
    }
    return this.db;
  }

  getDeck() {
    const deck = this.getObjectById(this.deckId);
    if (deck === undefined) {
      throw new Error("No deck found");
    }
    return deck as Deck;
  }

  markDirtyQuery(query: ObjectQuery = {}) {
    this.query(query, true).forEach((o) => this.dirtyIds.add(o.id));
  }

  markDirtyIds(ids: string[] | string) {
    if (Array.isArray(ids)) {
      ids.forEach((id) => this.dirtyIds.add(id));
    } else {
      this.dirtyIds.add(ids);
    }
  }

  markDirtyAll() {
    this.getAllObjects().forEach((o) => this.dirtyIds.add(o.rootId));
  }

  register(objectClass: PersistableObjectConstructor) {
    this.registry[ObjectManager.generateObjectKey(objectClass)] = objectClass;
    return this;
  }

  getObjectClass(objectType: ObjectType) {
    const key = ObjectManager.generateObjectKey(objectType);
    const objClass = this.registry[key];
    if (objClass === undefined) {
      throw new Error(`Object with key ${key} not found`);
    }
    return objClass;
  }

  setObject<T extends PersistableObject<any>>(obj: T, checkUnsaved = true) {
    const key = ObjectManager.generateObjectKey(obj);
    if (!(key in this.registry)) {
      throw new Error(`Cannot set unregistered object ${key}`);
    }

    this.applyObject(obj);

    if (checkUnsaved && obj.shouldPersist()) {
      obj.markDirty();
    }
    return this.getObjectById(obj.id) as T;
  }

  async loadAll() {
    const allDocs = await this.getDB().allDocs({ include_docs: true });
    this.resetObjects();

    const schemaChange: {
      toDelete: PersistedObject[];
      toPersist: Set<string>;
      docLevels: Record<string, number>;
    } = {
      toDelete: [],
      toPersist: new Set<string>(),
      docLevels: {},
    };
    const count: Record<string, number> = {};
    const timestampMap = new Map<PersistableObject<any>, number>();

    for (const { doc } of allDocs.rows) {
      if (doc._id.startsWith("_")) continue;
      this.instantiateObjectAndRegister(
        0,
        doc._id,
        doc._id,
        doc.lastPersistedTimestamp,
        pouchDeserialise(doc),
        schemaChange,
        timestampMap,
        count
      );
    }

    const rootIdsToPersist = new Set<string>(
      Array.from(schemaChange.toPersist.values()).map(
        (id) => this.getObjectById(id).rootId
      )
    );

    let updates: OrderedObjectOperation[] = [];
    if (schemaChange.toDelete.length > 0 || rootIdsToPersist.size > 0) {
      console.log("DB Schema changed: performing cleanup");
      const persists = Array.from(rootIdsToPersist.values()).map((id) => {
        const obj = this.getObjectById(id);
        const o: OrderedObjectOperation = {
          obj,
          operation: "persist",
          order: schemaChange.docLevels[id],
        };
        return o;
      });

      // persist with leaf-in ordering
      persists.sort((a, b) => b.order - a.order);
      updates = updates.concat(persists);

      updates = updates.concat(
        schemaChange.toDelete.map((s) => {
          const obj = new PersistableObject(s, this);
          const o: OrderedObjectOperation = {
            obj,
            operation: "delete",
            order: schemaChange.docLevels[obj.id],
          };
          return o;
        })
      );
    }

    const schemaUpdates = await this.applyOperations(updates, false);

    return { count, schemaUpdates };
  }

  instantiateObjectAndRegister(
    level: number,
    docRootId: string,
    docParentId: string,
    docLastPersistedTimestamp: number,
    serialisedDoc: any,
    schemaChange: {
      toDelete: PersistedObject[];
      toPersist: Set<string>;
      docLevels: Record<string, number>;
    },
    timestampMap: Map<PersistableObject<any>, number>,
    count: Record<string, number>
  ) {
    const { objects: serialisedEmbeddedObjs, ...serialisedObj } = serialisedDoc;
    serialisedEmbeddedObjs.forEach((o: any) =>
      this.instantiateObjectAndRegister(
        level + 1,
        docRootId,
        serialisedObj._id,
        docLastPersistedTimestamp,
        o,
        schemaChange,
        timestampMap,
        count
      )
    );
    const objectClass = this.getObjectClass(serialisedObj);
    const obj = new objectClass(serialisedObj, this);

    // document has moved
    if (obj.parentId !== docParentId) {
      if (obj.id == docRootId) {
        // root doc now embedded elsewhere
        // delete the original root doc
        schemaChange.toDelete.push(serialisedObj);
        // store obj id so we can use it to find the new root doc and persist
        schemaChange.toPersist.add(obj.id);
      } else if (obj.isEmbedded()) {
        // embedded doc now embedded elsewhere
        // store parentId to persist parent without embedding
        schemaChange.toPersist.add(docParentId);
        // store id to persist obj in new embedding
        schemaChange.toPersist.add(obj.id);
      } else {
        // embedded doc now becoming root
        // store parentId to persist parent without embedding
        schemaChange.toPersist.add(docParentId);
        // store id to create obj as root doc
        schemaChange.toPersist.add(obj.id);
      }
    }

    /*
    Handle the edge case of the same obj existing in another document (possible if a 
    migration is not completed or fully synced). In these cases we keep the newest
    obj, based on lastPersistedTimestamp
    */
    timestampMap.set(obj, docLastPersistedTimestamp);
    const existingTimestamp = timestampMap.get(this.getObjectById(obj.id));
    if (
      existingTimestamp === undefined ||
      existingTimestamp < docLastPersistedTimestamp
    ) {
      this.setObject(obj, false);
      schemaChange.docLevels[obj.id] = level;
    }

    count[obj.doctype] = (count[obj.doctype] ?? 0) + 1;
  }

  generateUpdates() {
    const objectsToUpdate: PersistableObject<any>[] = [];

    for (const id of this.dirtyIds) {
      const obj = this.getObjectById(id);
      if (obj?.shouldDelete() || obj?.shouldPersist()) {
        objectsToUpdate.push(obj);
      } else {
        this.dirtyIds.delete(id);
      }
    }

    //console.log("generateUpdates: objectsToUpdate:", objectsToUpdate);

    const g = new TransactionGraphV4(objectsToUpdate, this);
    // rootId to update order lookup
    const levels = g.assignLevels(true);

    const operations = objectsToUpdate.reduce((reduced, obj) => {
      const rootObj = obj.rootObj;
      reduced[obj.rootId] = {
        obj: rootObj,
        order: levels[rootObj.id],
        operation: rootObj.shouldDelete() ? "delete" : "persist",
      };
      return reduced;
    }, {} as Record<string, OrderedObjectOperation>);

    return Array.from(Object.values(operations));
  }

  async applyOperations(
    operations: OrderedObjectOperation[],
    sort = true,
    progressMonitor?: ProgressMonitor
  ) {
    if (progressMonitor) progressMonitor.total = operations.length;

    const sortedOperations = sort
      ? operations.toSorted((a, b) => {
          if (b.order === a.order) {
            return a.obj.doctype.localeCompare(b.obj.doctype);
          } else {
            return a.order - b.order;
          }
        })
      : operations;

    const deletions: Record<string, number> = {};
    const updates: Record<string, number> = {};

    for (const { obj, operation } of sortedOperations) {
      const allIds = [obj.id, ...obj.getEmbeddedIds(true)];
      if (operation == "delete") {
        if (!obj.isUnsaved()) {
          await this.deletePersistedObj(obj);
        }
        for (const id of allIds) {
          const obj = this.getObjectById(id);
          deletions[obj.doctype] = (deletions[obj.doctype] ?? 0) + 1;
          this.deleteObject(obj);
          //console.log(`deleted object ${obj.toString()} from object manager`);
          this.dirtyIds.delete(id);
        }
      } else if (operation == "persist") {
        //console.log("> persist", obj.toString());
        for (const id of allIds) {
          const obj = this.getObjectById(id);
          if (obj.shouldDelete()) {
            this.deleteObject(obj);
            deletions[obj.doctype] = (deletions[obj.doctype] ?? 0) + 1;
          } else {
            updates[obj.doctype] = (updates[obj.doctype] ?? 0) + 1;
          }
          this.dirtyIds.delete(id);
        }
        await this.persistObj(obj);
      }
      if (progressMonitor) progressMonitor.completed += 1;
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    return { results: { deletions, updates } };
  }

  /*async batchApplyOperations(operations: OrderedObjectOperation[]) {
    const deletions: Record<string, PersistableObject<any>[]> = {};
    const updates: Record<string, PersistableObject<any>[]> = {};

    const addOperation = (
      order: number,
      obj: PersistableObject<any>,
      batch: Record<number, PersistableObject<any>[]>
    ) => {
      if (order in batch) {
        batch[order].push(obj);
      } else {
        batch[order] = [obj];
      }
    };

    for (const { obj, operation, order } of operations) {
      const allIds = [obj.id, ...obj.getEmbeddedIds(true)];
      if (operation == "delete") {
        if (!obj.isUnsaved()) {
          addOperation(order, obj, deletions);
          //await this.deletePersistedObj(obj);
        }
        for (const id of allIds) {
          const obj = this.getObjectById(id);
          this.deleteObject(obj);
          this.dirtyIds.delete(id);
        }
      } else if (operation == "persist") {
        addOperation(order, obj, updates);
        //await this.persistObj(obj);
        for (const id of allIds) {
          const obj = this.getObjectById(id);
          if (obj.shouldDelete()) {
            this.deleteObject(obj);
          }
          this.dirtyIds.delete(id);
        }
      }
    }

    const allKeys = Array.from(
      new Set([...Object.keys(deletions), ...Object.keys(updates)]).values()
    ).sort();

    //console.log("deletions:", deletions);
    //console.log("updates:", updates);

    for (const orderKey of allKeys) {
      if (orderKey in deletions) {
        console.log(
          `bulk deleting ${orderKey}: ${deletions[orderKey].length} objects`
        );
        const startTime = Date.now();
        await this.bulkDeleteObjs(deletions[orderKey]);
        console.log(`Bulk delete completed in ${Date.now() - startTime}ms`);
      }
      if (orderKey in updates) {
        console.log(
          `bulk persisting ${orderKey}: ${updates[orderKey].length} objects`
        );
        const startTime = Date.now();
        await this.bulkPersistObjs(updates[orderKey]);
        console.log(`Bulk persist completed in ${Date.now() - startTime}ms`);
      }
    }
  }*/

  /*async bulkPersistObjs(objs: PersistableObject<any>[]) {
    const lastPersistedTimestamp = Date.now();
    let startTime = Date.now();
    const docs = objs.map((o) => ({
      ...pouchSerialise(o.serialise()),
      lastPersistedTimestamp,
    }));
    console.log(`serialisation completed in ${Date.now() - startTime}ms`);

    startTime = Date.now();
    const bulkRes = await this.getDB().bulkDocs(docs);
    console.log(
      `this.getDB().bulkDocs(...) completed in ${Date.now() - startTime}ms`
    );

    startTime = Date.now();
    for (const res of bulkRes) {
      if (res.id === undefined || res.rev === undefined) continue;
      this.updateObjectAfterPersist(
        res.id,
        { _rev: res.rev },
        lastPersistedTimestamp
      );
    }
    console.log(
      `updateObjectAfterPersist completed in ${Date.now() - startTime}ms`
    );
  }*/

  /*async bulkDeleteObjs(objs: PersistableObject<any>[]) {
    await this.getDB().bulkDocs(
      objs.map((o) => ({ ...pouchSerialise(o.serialise()), _deleted: true }))
    );
  }*/

  async persist(progressMonitor?: ProgressMonitor) {
    //console.log("ObjectManager.persist()");
    const operations = this.generateUpdates();
    console.log("ObjectManager.persist(): operations", operations);
    return this.applyOperations(operations, true, progressMonitor);
    //return this.batchApplyOperations(operations);
  }

  async persistObj(obj: PersistableObject<any>) {
    //console.log("persisting", obj);

    const lastPersistedTimestamp = Date.now();
    let res = await this.getDB().put(
      pouchSerialise(obj.serialise(true, lastPersistedTimestamp))
    );
    //console.log("persisted", obj);

    if (obj.hasAttachment()) {
      const attachment = obj.getAttachment();
      if (attachment === null) {
        //console.log("persistWithAttachment: before error", obj);
        throw new Error(`Document has no attachment to persist`);
      }
      res = await this.getDB().putAttachment(
        obj.id,
        "attachment",
        res.rev,
        isNode ? await blobToBuffer(attachment.data) : attachment.data,
        attachment.mimetype
      );
    }

    this.updateObjectAfterPersist(
      obj.id,
      { _rev: res.rev },
      lastPersistedTimestamp
    );
  }

  async fetchAttachment(id: string) {
    const db = this.getDB();
    const doc = await db.get(id, { attachments: false });

    const attachment = doc["_attachments"]?.["attachment"];
    if (attachment !== undefined) {
      const binary = await db.getAttachment(id, "attachment");
      if (binary instanceof Buffer) {
        return bufferToBlob(binary);
      } else {
        return binary as Blob;
      }
    } else {
      throw new Error(`Document has no attachments`);
    }
  }

  async deletePersistedObj(obj: PersistableObject<any>) {
    await this.getDB().remove(
      pouchSerialise(obj.serialise()) as PouchSerialisedSaved<PersistedObject>
    );
  }

  query(query: ObjectQuery, includeDeleted = false) {
    return this.getAllObjects().filter((o) => o.matches(query, includeDeleted));
  }

  _doctypeQueryCache: Record<string, CacheEntry<PersistableObject<any>[]>> = {};
  doctypeCachedQuery<T extends PersistableObject<any>>(
    query: ObjectQuery,
    doctypes: string[] = ["default"]
  ) {
    /* TODO: implement a query cache that uses the doctype specified in the query
    and recalculates on version change. This will also include the query with
    all deleted objects and apply the filtering on the cached values so that updates
    that toggle shouldDelete will also be reactive.

    I'm not sure why I wanted to use this?
    */

    const currentVersion = pick(this.version, doctypes);
    const cacheKey = JSON.stringify(query);
    const entry = this._doctypeQueryCache[cacheKey] as
      | CacheEntry<T[]>
      | undefined;

    if (entry !== undefined && isEqual(entry.version, currentVersion)) {
      return entry.result.filter((r) => !r.shouldDelete());
    } else {
      const result = this.query(query, true) as T[];
      const newEntry: CacheEntry<T[]> = {
        version: currentVersion,
        result: result,
      };
      this._doctypeQueryCache[cacheKey] = newEntry;
      return result;
    }
  }
}

export class ProgressMonitor {
  total: number | undefined;
  completed = 0;

  getProgress() {
    if (this.total) {
      return (this.completed / this.total) * 100;
    } else {
      return undefined;
    }
  }
}

type CacheEntry<T> = { version: Record<string, number>; result: T };

export function cacheByVersion(doctypes: string[] = ["default"]) {
  return function <
    This extends PersistableObject<any>,
    Ret extends PersistableObject<any>[]
  >(
    original: (this: This) => Ret,
    context: ClassMethodDecoratorContext<This, (this: This) => Ret>
  ) {
    if (context.kind !== "method") {
      throw new Error("@cacheByVersion must be used on a method");
    }

    const prop = `__${String(context.name)}Cache` as keyof This;

    const wrapped = function (this: This, skipCache = false): Ret {
      const currentVersion = pick(this.objectManager.version, doctypes);
      const entry = (this as any)[prop] as CacheEntry<Ret> | undefined;

      if (!skipCache && entry && isEqual(entry.version, currentVersion)) {
        return entry.result.filter((r) => !r.shouldDelete()) as Ret;
      }

      const result = original.call(this) as Ret;
      (this as any)[prop] = {
        version: currentVersion,
        result,
      } as CacheEntry<Ret>;
      console.log(
        `caching ${String(prop)} for version ${JSON.stringify(currentVersion)}`
      );
      return result;
    };

    return wrapped;
  };
}
