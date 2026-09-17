import { mkdir } from "node:fs/promises";

import { PouchDeckRegistry } from "core/service/registry.js";
import { ObjectManager } from "core/object_manager/ObjectManager.js";
import { Deck } from "core/Deck.js";
import { NoteType } from "core/NoteType.js";
import { Note } from "core/Note.js";
import { Card } from "core/Card.js";
import {
  TextField,
  TextFieldContent,
  ImageAttachmentField,
  ImageAttachmentContent,
  AudioAttachmentField,
  AudioAttachmentContent,
} from "core/fields/fields.js";
import { TextToSpeechField, TextToSpeechFieldContent } from "core/fields/generated.js";
import { FSRSScheduler } from "core/schedulers/FSRSScheduler.js";
import { FSRSSequence } from "core/schedulers/FSRSSequence.js";
import { WeightedRandomScheduler } from "core/schedulers/WeightedRandomScheduler.js";
import {
  CardTemplate,
  CardTemplateBlock,
  CardTemplateVariant,
  CardWidgetSettings,
  CardTemplateAttachment,
} from "core/CardTemplate.js";

import { config } from "./config.js";
import { auth } from "./auth.js";
import { log } from "./log.js";

/**
 * Mirrors registerObjects in frontendv2/src/lib/ReactiveObjectManager.ts.
 * Every persistable class must be registered before loadAll can rehydrate it.
 */
export const registerObjects = (om: ObjectManager) => {
  om.register(Deck)
    .register(NoteType)
    .register(Note)
    .register(Card)
    .register(TextField)
    .register(TextFieldContent)
    .register(ImageAttachmentField)
    .register(ImageAttachmentContent)
    .register(FSRSScheduler)
    .register(FSRSSequence)
    .register(WeightedRandomScheduler)
    .register(CardTemplate)
    .register(CardTemplateBlock)
    .register(CardTemplateVariant)
    .register(CardWidgetSettings)
    .register(CardTemplateAttachment)
    .register(TextToSpeechField)
    .register(TextToSpeechFieldContent)
    .register(AudioAttachmentField)
    .register(AudioAttachmentContent);
};

/**
 * core's getOrCreateDB calls `new PouchDB(name)` with no prefix, so the Node
 * LevelDB adapter creates one directory per database relative to the process
 * CWD. Claude Desktop starts servers in an arbitrary directory, so we move
 * into a known data directory once, before any database is opened.
 */
let dataDirReady = false;
export const ensureDataDir = async () => {
  if (dataDirReady) return;
  await mkdir(config.dataDir, { recursive: true });
  process.chdir(config.dataDir);
  dataDirReady = true;
  log(`local databases: ${config.dataDir}`);
};

let registry: PouchDeckRegistry | undefined;

const getRegistry = () => {
  if (registry === undefined) {
    registry = new PouchDeckRegistry(
      config.couchHost,
      { username: "", password: "" },
      "guest",
      false,
      // directMode=false routes through backend/proxy with a Firebase bearer
      // token, matching how the web client talks to CouchDB.
      false,
    );
  }
  return registry;
};

export type DeckSummary = {
  id: string;
  name: string;
  noteTypes: number;
  notes: number;
  cards: number;
};

/**
 * "once"  — replicate both ways, then stop. Nothing keeps running afterwards;
 *           run syncDecks again to push later work back to the server.
 * "live"  — replicate, then leave continuous replication running for the life
 *           of the process (core's default behaviour).
 */
export type SyncMode = "once" | "live";

export type SyncResult = {
  couchId: string;
  mode: SyncMode;
  remoteReachable: boolean;
  deckIds: string[];
  decks: DeckSummary[];
  failed: { deckId: string; error: string }[];
};

type LoadedDeck = {
  deck: Deck;
  om: ObjectManager;
  localDB: PouchDB.Database<any>;
};

const loaded = new Map<string, LoadedDeck>();

const summarise = (deck: Deck): DeckSummary => ({
  id: deck.id,
  name: deck.name,
  noteTypes: deck.getAllNoteTypes().length,
  notes: deck.getAllNotes().length,
  cards: deck.getAllCards().length,
});

/**
 * One bidirectional replication pass against the remote database, with no
 * continuous replication left behind. The remote handle is opened for the
 * duration of the pass and closed again.
 */
const replicateOnce = async (reg: PouchDeckRegistry, localDB: PouchDB.Database<any>) => {
  const remoteDB = await reg.createNewRemoteDB(localDB.name);
  try {
    await reg.syncDBs(localDB, remoteDB);
  } finally {
    await remoteDB.close().catch(() => undefined);
  }
};

const loadDeck = async (om: ObjectManager) => {
  await om.loadAll();
  const deck = om.getKeyObject();
  if (!(deck instanceof Deck)) {
    throw new Error("synced database contains no deck object");
  }
  deck.createMissingCards();
  return deck;
};

/**
 * Reconcile decks between the server and the local PouchDB copy, then load
 * them.
 *
 * discover() is bidirectional: it returns the union of local and remote deck
 * ids, registering a local database for anything found only on the server.
 * Replicating a deck that exists only locally creates its remote database, so
 * decks travel in both directions.
 *
 * Re-running this is how local work gets pushed back to the server, and how
 * decks created elsewhere are picked up.
 */
export const syncDecks = async (mode: SyncMode = "once"): Promise<SyncResult> => {
  if (!auth.signedIn) {
    throw new Error("Not signed in — call the `login` tool first.");
  }
  const couchId = auth.couchId!;

  await ensureDataDir();

  const reg = getRegistry();

  // shouldSync must be true for discover() to list remote databases. It flips
  // itself to false if the remote cannot be reached, which is how we detect
  // an offline run.
  await reg.initialise(couchId, auth.tokenGenerator, true);
  loaded.clear();

  const deckIds = await reg.discover();
  const remoteReachable = reg.shouldSync;
  log(
    `discovered ${deckIds.length} deck(s) for ${couchId}` +
      (remoteReachable ? "" : " (remote unreachable — local only)"),
  );

  // In "once" mode we take replication into our own hands: with shouldSync
  // false, core's initialiseDB opens and registers the local database without
  // starting the continuous replication it would otherwise leave running.
  if (mode === "once") {
    reg.shouldSync = false;
  }

  const decks: DeckSummary[] = [];
  const failed: { deckId: string; error: string }[] = [];

  // Sequential rather than parallel: each deck opens a LevelDB handle and a
  // replication stream, and failures are much easier to attribute this way.
  for (const deckId of deckIds) {
    try {
      const localDB = await reg.initialiseDB(deckId);
      if (mode === "once" && remoteReachable) {
        await replicateOnce(reg, localDB);
      }

      const om = new ObjectManager(deckId);
      registerObjects(om);
      om.db = localDB;

      const deck = await loadDeck(om);
      loaded.set(deckId, { deck, om, localDB });
      decks.push(summarise(deck));
    } catch (err) {
      const error = (err as Error).message;
      log(`deck ${deckId} failed: ${error}`);
      failed.push({ deckId, error });
    }
  }

  return { couchId, mode, remoteReachable, deckIds, decks, failed };
};

export const listLoadedDecks = (): DeckSummary[] =>
  [...loaded.values()].map(({ deck }) => summarise(deck));

export const hasSynced = () => loaded.size > 0;

export const getLoadedDeck = (deckId: string) => loaded.get(deckId)?.deck;
