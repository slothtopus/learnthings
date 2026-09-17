import { log } from "../utils/log.js";
import PouchDBFind from "pouchdb-find";
import PouchDBAdapterMemory from "pouchdb-adapter-memory";
import { isNode } from "browser-or-node";

import { isValidId } from "../utils/ids.js";
import type { PersistedObject } from "../object_manager/PersistableObject.js";

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

/**
 * PouchDB 9.0.0 predates Node's built-in fetch.
 *
 * When replicating an attachment, its HTTP adapter picks how to read the body:
 *
 *     if ('buffer' in response) { blob = await response.buffer(); }
 *     else                      { blob = await response.blob();   }
 *
 * `.buffer()` is the node-fetch v2 API. Node 18+ ships undici, whose Response
 * has no `.buffer()`, so PouchDB takes the browser branch and produces a Blob —
 * which it then hands to `binaryMd5`, which calls Node's crypto, which rejects
 * Blob outright:
 *
 *     TypeError: The "data" argument must be of type string or an instance of
 *     Buffer, TypedArray, or DataView. Received an instance of Blob
 *
 * Worse, the rejection escapes the replication promise, so a sync carrying
 * attachments neither resolves nor rejects — it simply hangs.
 *
 * Restoring a lazy `.buffer()` puts PouchDB back on the Node branch. It reads
 * nothing unless PouchDB calls it. In the browser a Blob is the correct type,
 * so this is a no-op there.
 */
export const withNodeFetchCompat = (response: Response): Response => {
  if (!isNode) return response;
  if (typeof (response as { buffer?: unknown }).buffer === "function") {
    return response;
  }
  Object.defineProperty(response, "buffer", {
    value: async () => Buffer.from(await response.arrayBuffer()),
    writable: true,
    configurable: true,
    enumerable: false,
  });
  return response;
};

let _dbCache: Record<string, PouchDB.Database<any>> = {};
export const getOrCreateDB = async (dbName: string, memoryOnly: boolean) => {
  if (!(dbName in _dbCache)) {
    log.debug(`getOrCreateDB: creating db ${dbName}`);
    const PouchDB = await getPouchDB();
    const db = memoryOnly
      ? new PouchDB<{ doctype: string }>(dbName, { adapter: "memory" })
      : new PouchDB<{ doctype: string }>(dbName);
    await db.createIndex({ index: { fields: ["doctype"] } });
    _dbCache[dbName] = db;
  }
  return _dbCache[dbName];
};

export const clearAndCloseDBCache = async () => {
  await Promise.all(Object.values(_dbCache).map((db) => db.close()));
  _dbCache = {};
};

export const getOrCreateLocalDeckDB = (
  userId: string,
  deckId: string,
  memoryOnly: boolean,
) => {
  return getOrCreateDB(buildDeckDBName(userId, deckId), memoryOnly);
};

export const buildDeckDBName = (userId: string, deckId: string) =>
  `${userId}\$ltdeck\$${deckId}`;

export const buildMetaDBName = (userId: string) => `${userId}\$ltmeta`;

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
  obj: S,
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
        obj._meta,
      )} not Pouch meta: ${JSON.stringify(obj, null, 2)}`,
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
  obj: PouchSerialisedSaved<S>,
): S => {
  const { _rev, ...rest } = obj;
  return { ...rest, _meta: { _rev } } as unknown as S;
};
