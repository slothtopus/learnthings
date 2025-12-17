import {
  cacheByVersion,
  type ObjectManager,
  type ProgressMonitor,
} from "./ObjectManager";
import {
  PersistableObject,
  PersistableObjectConstructor,
  type PersistedObject,
} from "./PersistableObject";
import { NoteType } from "./NoteType";
import type { Note } from "./Note";
import type { Card } from "./Card";
import { FSRSScheduler } from "./schedulers/FSRSScheduler";
import type { Scheduler } from "./schedulers/Scheduler";

export type SerialisedDeck = {
  name: string;
  activeSchedulerId?: string;
  objects?: any[];
} & PersistedObject;

export class Deck extends PersistableObject<SerialisedDeck> {
  static doctype = "deck";
  static subtype = "deck";

  shouldPersistIfUnsaved = true;
  name: string;

  activeSchedulerId?: string;
  getActiveScheduler() {
    if (this.activeSchedulerId === undefined) {
      const scheduler = FSRSScheduler.createNew(this.objectManager);
      this.activeSchedulerId = scheduler.id;
      this.objectManager.setObject(scheduler);
      this.markDirty();
    }
    return this.objectManager.getObjectById(
      this.activeSchedulerId
    ) as Scheduler<any>;
  }

  setActiveScheduler(cls: PersistableObjectConstructor) {
    if (this.activeSchedulerId) {
      this.objectManager.markDirtyIds(this.activeSchedulerId);
    }
    const scheduler = cls.createNew(this.objectManager);
    this.objectManager.setObject(scheduler);
    this.activeSchedulerId = scheduler.id;
  }

  static createNew(
    objectManager: ObjectManager,
    { id, name }: { id?: string; name: string }
  ) {
    return new Deck({ ...PersistableObject.create(id), name }, objectManager);
  }

  constructor(serialisedDeck: SerialisedDeck, objectManager: ObjectManager) {
    super(serialisedDeck, objectManager);
    this.objectManager = objectManager;
    const { name, activeSchedulerId } = serialisedDeck;
    this.name = name;
    this.activeSchedulerId = activeSchedulerId;
  }

  setName(name: string) {
    this.name = name;
    this.markDirty();
  }

  createNewNoteType(name: string) {
    const notetype = NoteType.createNew(this.objectManager, { name });
    this.objectManager.setObject(notetype);
    return notetype;
  }

  @cacheByVersion(["notetype"])
  getAllNoteTypes() {
    return this.objectManager.query({
      include: { doctype: "notetype" },
    }) as NoteType[];
  }

  @cacheByVersion(["note"])
  getAllNotes() {
    return this.objectManager.query({ include: { doctype: "note" } }) as Note[];
  }

  @cacheByVersion(["card"])
  getAllCards() {
    return this.objectManager.query({ include: { doctype: "card" } }) as Card[];
  }

  createMissingCards() {
    this.getAllNotes().flatMap((n) => n.getAllCards());
    console.log("new cards created");
  }

  async persist(progressMonitor?: ProgressMonitor) {
    return this.objectManager.persist(progressMonitor);
  }

  serialise(
    ...args: Parameters<PersistableObject<any>["serialise"]>
  ): SerialisedDeck {
    return {
      ...super.serialise(...args),
      name: this.name,
      activeSchedulerId: this.activeSchedulerId,
    };
  }
}
