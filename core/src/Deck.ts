import {
  cacheByVersion,
  type ObjectManager,
  type ProgressMonitor,
} from "./ObjectManager";
import { PersistableObject, type PersistedObject } from "./PersistableObject";
import { NoteType } from "./NoteType";
import type { Note } from "./Note";
import type { Card } from "./Card";
import { FSRSScheduler } from "./FSRSScheduler";

export type SerialisedDeck = {
  name: string;
  schedulerId?: string;
  objects?: any[];
} & PersistedObject;

export class Deck extends PersistableObject<SerialisedDeck> {
  static doctype = "deck";
  static subtype = "deck";

  shouldPersistIfUnsaved = true;
  name: string;

  schedulerId?: string;
  getScheduler() {
    if (this.schedulerId === undefined) {
      const scheduler = FSRSScheduler.createNewEmpty(this.objectManager);
      this.schedulerId = scheduler.id;
      this.objectManager.setObject(scheduler);
      this.markDirty();
    }
    return this.objectManager.getObjectById(this.schedulerId) as FSRSScheduler;
  }

  static createNewEmpty(
    objectManager: ObjectManager,
    { id, name }: { id?: string; name: string }
  ) {
    return new Deck({ ...PersistableObject.create(id), name }, objectManager);
  }

  constructor(serialisedDeck: SerialisedDeck, objectManager: ObjectManager) {
    super(serialisedDeck, objectManager);
    this.objectManager = objectManager;
    const { name, schedulerId } = serialisedDeck;
    this.name = name;
    this.schedulerId = schedulerId;
  }

  createNewNoteType(name: string) {
    const notetype = NoteType.createNewEmpty(this.objectManager, { name });
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

  serialise(includeObjects = true): SerialisedDeck {
    return {
      ...super.serialise(includeObjects),
      name: this.name,
      schedulerId: this.schedulerId,
    };
  }
}
