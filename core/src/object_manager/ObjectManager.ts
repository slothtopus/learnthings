import { PersistableObject, PersistedObject } from "./PersistableObject";
import {
  getOrCreateLocalDeckDB,
  pouchSerialise,
  pouchDeserialise,
} from "../service/PouchDB";
import { blobToBuffer, bufferToBlob } from "../utils/attachments";
import { TransactionGraphV4 } from "./TransactionGraph";

import type { PouchSerialisedSaved } from "../service/PouchDB";
import type { PersistableObjectConstructor } from "./PersistableObject";
import type { ProgressMonitor } from "./utils";

import { isNode } from "browser-or-node";

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
  db: Awaited<ReturnType<typeof getOrCreateLocalDeckDB>> | undefined;
  registry: Record<string, PersistableObjectConstructor> = {};
  objectsById: Record<string, PersistableObject<PersistedObject>> = {};

  dirtyIds = new Set<string>();

  version: Record<string, number> = { default: 0 };

  keyObjectId?: string;

  constructor(keyObjectId?: string) {
    this.keyObjectId = keyObjectId;
  }

  getKeyObject() {
    if (this.keyObjectId === undefined) {
      throw new Error(`No key object defined`);
    }
    const keyObj = this.getObjectById(this.keyObjectId);
    return keyObj;
  }

  static generateObjectKey({
    doctype,
    subtype,
  }: {
    doctype: string;
    subtype: string;
  }) {
    return `${doctype}:${subtype}`;
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
    lastPersistedTimestamp: number,
  ) {
    this.getObjectById(id).updateAfterPersist(meta, lastPersistedTimestamp);
  }

  getDB() {
    if (this.db === undefined) {
      throw new Error("Not initialised");
    }
    return this.db;
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
        count,
      );
    }

    const rootIdsToPersist = new Set<string>(
      Array.from(schemaChange.toPersist.values()).map(
        (id) => this.getObjectById(id).rootId,
      ),
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
        }),
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
    count: Record<string, number>,
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
        count,
      ),
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

    const operations = objectsToUpdate.reduce(
      (reduced, obj) => {
        const rootObj = obj.rootObj;
        reduced[obj.rootId] = {
          obj: rootObj,
          order: levels[rootObj.id],
          operation: rootObj.shouldDelete() ? "delete" : "persist",
        };
        return reduced;
      },
      {} as Record<string, OrderedObjectOperation>,
    );

    return Array.from(Object.values(operations));
  }

  async applyOperations(
    operations: OrderedObjectOperation[],
    sort = true,
    progressMonitor?: ProgressMonitor,
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
      pouchSerialise(obj.serialise(true, lastPersistedTimestamp)),
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
        attachment.mimetype,
      );
    }

    this.updateObjectAfterPersist(
      obj.id,
      { _rev: res.rev },
      lastPersistedTimestamp,
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
      pouchSerialise(obj.serialise()) as PouchSerialisedSaved<PersistedObject>,
    );
  }

  query(query: ObjectQuery, includeDeleted = false) {
    return this.getAllObjects().filter((o) => o.matches(query, includeDeleted));
  }
}
