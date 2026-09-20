import { log } from "./utils/log.js";
import type { ObjectManager } from "./object_manager/ObjectManager.js";
import { cacheByVersion } from "./object_manager/utils.js";
import type { ProgressMonitor } from "./object_manager/utils.js";
import {
  PersistableObject,
  type CreatablePersistableObjectConstructor,
  type PersistedObject,
} from "./object_manager/PersistableObject.js";
import { NoteType } from "./NoteType.js";
import { compareNoteOrder } from "./Note.js";
import type { Note } from "./Note.js";
import type { Card } from "./Card.js";
import { FSRSScheduler } from "./schedulers/FSRSScheduler.js";
import type { Scheduler } from "./schedulers/Scheduler.js";

export type SerialisedDeck = {
  name: string;
  /** What this deck covers. Shown in the library and given to agents. */
  description?: string;
  activeSchedulerId?: string;
  objects?: any[];
} & PersistedObject;

export class Deck extends PersistableObject<SerialisedDeck> {
  static doctype = "deck";
  static subtype = "deck";

  shouldPersistIfUnsaved = true;
  name: string;
  description?: string;

  activeSchedulerId?: string;
  getActiveScheduler() {
    if (this.activeSchedulerId === undefined) {
      const scheduler = FSRSScheduler.createNew(this.objectManager);
      this.activeSchedulerId = scheduler.id;
      this.objectManager.setObject(scheduler);
      this.markDirty();
    }
    return this.objectManager.getObjectById(
      this.activeSchedulerId,
    ) as Scheduler<any>;
  }

  setActiveScheduler(cls: CreatablePersistableObjectConstructor<any, any>) {
    if (this.activeSchedulerId) {
      this.objectManager.markDirtyIds(this.activeSchedulerId);
    }
    const scheduler = cls.createNew(this.objectManager);
    this.objectManager.setObject(scheduler);
    this.activeSchedulerId = scheduler.id;
    this.markDirty()
  }

  static createNew(
    objectManager: ObjectManager,
    { id, name, description }: { id?: string; name: string; description?: string },
  ) {
    return new Deck(
      { ...PersistableObject.create(id), name, description },
      objectManager,
    );
  }

  constructor(serialisedDeck: SerialisedDeck, objectManager: ObjectManager) {
    super(serialisedDeck, objectManager);
    this.objectManager = objectManager;
    const { name, description, activeSchedulerId } = serialisedDeck;
    this.name = name;
    this.description = description;
    this.activeSchedulerId = activeSchedulerId;
  }

  setDescription(description: string | undefined) {
    const next = description?.trim() ? description.trim() : undefined;
    if (next !== this.description) {
      this.description = next;
      this.markDirty();
    }
  }

  setName(name: string) {
    this.name = name;
    this.markDirty();
  }

  createNewNoteType(name: string) {
    return this.objectManager.setObject(
      NoteType.createNew(this.objectManager, { name }),
    );
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

  /**
   * Every note, in a deterministic order. Not cached by version: setOrder marks
   * the note dirty but does not bump the note version, so a cached ordering
   * would survive a reorder. The underlying getAllNotes is cached, so this only
   * pays for the sort.
   */
  getAllNotesOrdered() {
    return [...this.getAllNotes()].sort(compareNoteOrder);
  }

  @cacheByVersion(["card"])
  getAllCards() {
    return this.objectManager.query({ include: { doctype: "card" } }) as Card[];
  }

  createMissingCards() {
    this.getAllNotes().flatMap((n) => n.getAllCards());
    log.debug("new cards created");
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
      description: this.description,
      activeSchedulerId: this.activeSchedulerId,
    };
  }
}
