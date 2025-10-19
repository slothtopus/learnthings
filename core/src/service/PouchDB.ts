import PouchDBFind from "pouchdb-find";
import PouchDBAdapterMemory from "pouchdb-adapter-memory";
import { isNode } from "browser-or-node";

import { isValidId } from "../utils/ids";
import type { PersistedObject } from "../PersistableObject";

let _PouchDB: PouchDB.Static<{}> | undefined = undefined;
export const getPouchDB = async () => {
  if (_PouchDB === undefined) {
    _PouchDB = (await (isNode ? import("pouchdb") : import("pouchdb-browser")))
      .default;
    _PouchDB.plugin(PouchDBFind);
    _PouchDB.plugin(PouchDBAdapterMemory);
  }
  return _PouchDB;
};

let _dbCache: Record<string, PouchDB.Database<any>> = {};
export const getOrCreateDB = async (dbName: string, memoryOnly: boolean) => {
  let isNew = false;
  if (!(dbName in _dbCache)) {
    console.log(`getOrCreateDB: creating db ${dbName}`);
    const PouchDB = await getPouchDB();
    const db = memoryOnly
      ? new PouchDB<{ doctype: string }>(dbName, { adapter: "memory" })
      : new PouchDB<{ doctype: string }>(dbName);
    await db.createIndex({ index: { fields: ["doctype"] } });
    _dbCache[dbName] = db;
    isNew = true;
  }
  return _dbCache[dbName];
};

export const clearDBCache = () => {
  _dbCache = {};
};

export const getOrCreateLocalDeckDB = (
  userId: string,
  deckId: string,
  memoryOnly: boolean
) => {
  return getOrCreateDB(buildDeckDBName(userId, deckId), memoryOnly);
};

export const buildDeckDBName = (userId: string, deckId: string) =>
  `${userId}\$ltdeck\$${deckId}`;

export const parseDeckDBName = (dbName: string) => {
  const regex = /^(.+?)\$ltdeck\$(.+)$/;
  const match = dbName.match(regex);

  if (match) {
    const userId = match[1];
    const deckId = match[2];
    return isValidId(deckId) ? { userId, deckId } : undefined;
  } else {
    return undefined;
  }
};

export const pouchSerialise = <S extends PersistedObject>(
  obj: S
): PouchSerialised<S> => {
  const { _meta, ...rest } = obj;
  if (_meta === null) {
    return rest;
  } else if (
    typeof _meta === "object" &&
    _meta._rev !== undefined &&
    typeof _meta._rev == "string"
  ) {
    return { ...rest, _rev: _meta._rev };
  } else {
    throw new Error(
      `Object meta ${JSON.stringify(
        obj._meta
      )} not Pouch meta: ${JSON.stringify(obj, null, 2)}`
    );
  }
};

export type PouchSerialised<S extends PersistedObject> = Omit<S, "_meta"> & {
  _rev?: string;
};

export type PouchSerialisedSaved<S extends PersistedObject> = Omit<
  S,
  "_meta"
> & {
  _rev: string;
};

export const pouchDeserialise = <S extends PersistedObject>(
  obj: PouchSerialisedSaved<S>
): S => {
  const { _rev, ...rest } = obj;
  return { ...rest, _meta: { _rev } } as unknown as S;
};
