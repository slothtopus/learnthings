import { describe, expect, test } from "vitest";

import { ObjectManager } from "../object_manager/ObjectManager.js";
import { Deck } from "../Deck.js";
import { NoteType } from "../NoteType.js";
import { generateId } from "../utils/ids.js";

/**
 * The same object id can appear in two documents when a migration was not
 * finished or fully synced. Loading keeps whichever copy was persisted most
 * recently, regardless of the order the documents arrive in.
 */

/** Mirrors the frontend, where objectsById is reactive and hands back proxies. */
const wrapped = new WeakMap<object, any>();
const proxyFor = (v: any) => {
  if (v === null || typeof v !== "object") return v;
  if (!wrapped.has(v)) wrapped.set(v, new Proxy(v, {}));
  return wrapped.get(v);
};

class ProxyingObjectManager extends ObjectManager {
  objectsById: Record<string, any> = this.makeStore();
  private makeStore() {
    return new Proxy({} as Record<string, any>, {
      get: (t, k) => proxyFor(t[k as string]),
    });
  }
  resetObjects(): void {
    this.objectsById = this.makeStore();
  }
}

/** Load two documents holding the same note type, and report which name won. */
const loadBoth = (
  om: ObjectManager,
  deckId: string,
  docs: { name: string; timestamp: number }[],
) => {
  om.setObject(Deck.createNew(om, { id: deckId, name: "deck" }));

  const noteTypeId = generateId();
  const schemaChange = { toDelete: [], toPersist: new Set<string>(), docLevels: {} };
  const timestampMap = new Map<string, number>();
  const count: Record<string, number> = {};

  for (const { name, timestamp } of docs) {
    om.instantiateObjectAndRegister(
      0,
      noteTypeId,
      noteTypeId,
      timestamp,
      {
        _id: noteTypeId,
        doctype: "notetype",
        subtype: "base",
        name,
        objects: [],
        lastPersistedTimestamp: timestamp,
        _meta: null,
      },
      schemaChange,
      timestampMap,
      count,
    );
  }
  return (om.getObjectById(noteTypeId) as NoteType).name;
};

const managers = [
  ["plain", (id: string) => new ObjectManager(id)],
  ["reactive (proxying)", (id: string) => new ProxyingObjectManager(id)],
] as const;

describe.each(managers)("loading the same object twice — %s manager", (_label, make) => {
  const build = () => {
    const deckId = generateId();
    const om = make(deckId).register(Deck).register(NoteType);
    return { om, deckId };
  };

  test("keeps the newer copy when it arrives second", () => {
    const { om, deckId } = build();
    expect(
      loadBoth(om, deckId, [
        { name: "older", timestamp: 100 },
        { name: "newer", timestamp: 200 },
      ]),
    ).toBe("newer");
  });

  test("keeps the newer copy when it arrives first", () => {
    const { om, deckId } = build();
    expect(
      loadBoth(om, deckId, [
        { name: "newer", timestamp: 200 },
        { name: "older", timestamp: 100 },
      ]),
    ).toBe("newer");
  });
});
