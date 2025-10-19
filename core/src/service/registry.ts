import {
  getOrCreateDB,
  getPouchDB,
  parseDeckDBName,
  buildDeckDBName,
  getOrCreateLocalDeckDB,
  clearDBCache,
} from "./PouchDB";

export class PouchDeckRegistry {
  url: string;
  auth: { username: string; password: string };
  userId: string;
  tokenGenerator: () => Promise<string | undefined> = async () => {
    return undefined;
  };
  memoryOnly: boolean;
  shouldSync = false;
  directMode: boolean;

  _registryDB: PouchDB.Database<any> | undefined;
  async getRegistryDB() {
    if (this._registryDB === undefined) {
      this._registryDB = await getOrCreateDB(`ltregistry`, this.memoryOnly);
    }
    return this._registryDB;
  }

  constructor(
    url: string,
    auth: { username: string; password: string },
    userId: string,
    memoryOnly: boolean,
    directMode = true
  ) {
    this.url = url;
    this.auth = auth;
    this.userId = userId;
    this.memoryOnly = memoryOnly;
    this.directMode = directMode;
  }

  async reset() {
    clearDBCache();
    await Promise.all(
      this._syncHandlers.map(async ({ handler, localDB, remoteDB }) => {
        handler.cancel();
        await localDB.close();
        await remoteDB.close();
      })
    );
    this._syncHandlers = [];
  }

  async initialise(
    userId: string,
    tokenGenerator: () => Promise<string | undefined>,
    shouldSync: boolean
  ) {
    await this.reset();
    this.userId = userId;
    this.tokenGenerator = tokenGenerator;
    this.shouldSync = shouldSync;
  }

  async getLocalDeckIds() {
    const db = await this.getRegistryDB();
    const allDocs = await db.allDocs({ limit: 999 });
    return allDocs.rows.flatMap((d) => {
      const dbName = d.id;
      const parsed = parseDeckDBName(dbName);
      return parsed && parsed.userId == this.userId ? [parsed.deckId] : [];
    });
  }

  async getRemoteDeckIds() {
    const opts: any = {
      method: "GET",
      headers: {
        Authorization:
          "Basic " + btoa(`${this.auth.username}:${this.auth.password}`),
      },
    };

    if (!this.directMode) {
      opts["credentials"] = "omit";
      opts.headers["x-user-id"] = this.userId;
      const token = await this.tokenGenerator();
      if (token) {
        opts.headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const resp = await fetch(`${this.url}/_all_dbs`, opts);
    const remoteDBNames: string[] = await resp.json();

    return remoteDBNames.flatMap((dbName) => {
      const parsed = parseDeckDBName(dbName);
      return parsed && parsed.userId == this.userId ? [parsed.deckId] : [];
    });
  }

  async discover() {
    const localDeckIds = await this.getLocalDeckIds();
    let remoteDeckIds: string[] = [];
    if (this.shouldSync) {
      try {
        remoteDeckIds = await this.getRemoteDeckIds();
      } catch {
        this.shouldSync = false;
      }
    }
    const newLocalDeckIds = remoteDeckIds.filter(
      (remoteId) => !localDeckIds.includes(remoteId)
    );
    const db = await this.getRegistryDB();
    await Promise.all(
      newLocalDeckIds.map((id) =>
        db.put({ _id: buildDeckDBName(this.userId, id) })
      )
    );
    return [...new Set([...localDeckIds, ...remoteDeckIds]).values()].sort();
  }

  async export(deckId: string) {
    const localDB = await getOrCreateLocalDeckDB(
      this.userId,
      deckId,
      this.memoryOnly
    );

    return localDB.allDocs({ include_docs: true });
  }

  async createNewRemoteDB(name: string) {
    const PouchDB = await getPouchDB();
    return new PouchDB(`${this.url}/${name}`, {
      auth: this.auth,
      fetch: async (url, opts) => {
        if (this.directMode) {
          return fetch(url, opts);
        } else {
          const headers = new Headers(opts?.headers);
          headers.append("x-user-id", this.userId);
          const token = await this.tokenGenerator();
          if (token) {
            headers.set("Authorization", `Bearer ${token}`);
          }
          return fetch(url, { ...opts, credentials: "omit", headers });
        }
      },
    });
  }

  async initialiseSync(localDB: PouchDB.Database) {
    const remoteDB = await this.createNewRemoteDB(localDB.name);
    console.log(`registry.syncDBs: ${localDB.name} <--> ${remoteDB.name}`);
    await this.syncDBs(localDB, remoteDB);
    this.startLiveSync(localDB, remoteDB);
  }

  syncDBs(localDB: PouchDB.Database, remoteDB: PouchDB.Database) {
    return new Promise((resolve, reject) => {
      const repl = remoteDB.sync(localDB);
      repl.on("complete", resolve);
      repl.on("error", reject);
    });
  }

  _syncHandlers: {
    handler: PouchDB.Replication.Sync<any>;
    localDB: PouchDB.Database;
    remoteDB: PouchDB.Database;
  }[] = [];
  startLiveSync(localDB: PouchDB.Database, remoteDB: PouchDB.Database) {
    const handler = localDB
      .sync(remoteDB, {
        live: true,
        retry: true,
      })
      .on("change", function (change) {
        console.log("SYNC change:", change);
      })
      .on("paused", function (info) {
        // replication was paused, usually because of a lost connection
        console.log("SYNC paused:", info);
      })
      // @ts-ignore
      .on("active", function (info) {
        console.log("SYNC active:", info);
        // replication was resumed
      })
      .on("error", function (err) {
        console.log("SYNC error:", err);
        // totally unhandled error (shouldn't happen)
      });
    this._syncHandlers.push({ handler, localDB, remoteDB });
  }

  async registerDeckDB(userId: string, deckId: string) {
    const db = await this.getRegistryDB();
    try {
      await db.put({ _id: buildDeckDBName(userId, deckId) });
    } catch (err: any) {
      if (err?.name !== "conflict") {
        throw err;
      }
    }
  }

  async initialiseDB(deckId: string) {
    const db = await getOrCreateLocalDeckDB(
      this.userId,
      deckId,
      this.memoryOnly
    );
    await this.registerDeckDB(this.userId, deckId);
    if (this.shouldSync) {
      await this.initialiseSync(db);
    }
    return db;
  }

  async delete(deckId: string) {
    const db = await this.getRegistryDB();
    const localDB = await getOrCreateLocalDeckDB(
      this.userId,
      deckId,
      this.memoryOnly
    );
    const dbName = buildDeckDBName(this.userId, deckId);
    const { _id, _rev } = await db.get(dbName);
    await db.remove({ _id, _rev });
    await localDB.destroy();
    if (this.userId !== "guest") {
      const remoteDB = await this.createNewRemoteDB(localDB.name);
      await remoteDB.destroy();
    }
  }
}
