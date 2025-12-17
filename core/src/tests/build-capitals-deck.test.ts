import { test, expect } from "vitest";

import { ObjectManager } from "../ObjectManager.js";
import { generateId } from "../utils/ids.js";

import { Deck } from "../Deck.js";
import { NoteType } from "../NoteType.js";
import { Note } from "../Note.js";
import { CardTemplate } from "../CardTemplate";
import { Card } from "../Card.js";
import {
  AttachmentNoteField,
  AttachmentNoteFieldContent,
  TextNoteField,
} from "../NoteField.js";
import { TextNoteFieldContent } from "../NoteField.js";
import { FSRSScheduler } from "../schedulers/FSRSScheduler.js";

import capitals from "../data/capitals.json";
import { getOrCreateLocalDeckDB } from "../service/PouchDB.js";

const CSS = `
main#root {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #003153;
  background-image: linear-gradient(315deg, #003153 0%, #1B1B1B 74%);
}

hr {
  width: 60%;
  border-color: grey;
}

#content {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 1rem 1fr;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  flex-grow: 1;
}

h1 {
  font-size: 2rem;
  text-align: center;
  align-self: flex-end;
}

.fade-in {
  animation: fadein 0.5s;
}

@keyframes fadein {
  0% {
    opacity: 0;
  }
}

h1.front {
  align-self: flex-end;
}

h1.back {
  align-self: flex-start;
}

#controls {
  display: flex;
  justify-content: center;
  padding: 1rem 1rem 2rem 1rem;
}
`;

const FRONT = `
<div id="content">
  <h1 class="front fade-in">{{FIELD_ONE}}</h1>
  <hr />
</div>
<div id="controls">
  <reveal-button />
</div>
`;

const BACK = `
<div id="content">
  <h1 class="front">{{FIELD_ONE}}</h1>
  <hr />
  <h1 class="back fade-in">{{FIELD_TWO}}</h1>
</div>
<div id="controls">
  <rating-buttons />
</div>
`;

export const setupObjectManager = async (deckId: string, userId: string) => {
  const om = new ObjectManager(deckId)
    .register(Deck)
    .register(NoteType)
    .register(CardTemplate)
    .register(Note)
    .register(Card)
    .register(TextNoteField)
    .register(TextNoteFieldContent)
    .register(AttachmentNoteField)
    .register(AttachmentNoteFieldContent)
    .register(FSRSScheduler);
  om.db = await getOrCreateLocalDeckDB(userId, deckId, true);
  return om;
};

export const createNewDeck = async (userId: string, name: string) => {
  const deckId = generateId();
  const om = await setupObjectManager(deckId, userId);
  om.setObject(Deck.createNew(om, { id: deckId, name }));
  const deck = om.getDeck();
  await deck.persist();
  return deck;
};

let deck: Deck | undefined;

test("build capitals deck", async () => {
  const startTime = Date.now();
  deck = await createNewDeck("guest-1", "Countries and Capitals");
  const noteType = deck.createNewNoteType("Countries and Capitals");
  const countryField = noteType.createNewField("country", TextNoteField, {});
  const capitalField = noteType.createNewField("capital", TextNoteField, {});

  for (const { country, capital } of capitals) {
    const note = noteType.createNewNote();
    countryField.getOrCreateContent(note).setContent(country);
    capitalField.getOrCreateContent(note).setContent(capital);
  }

  const co2caTemplate = noteType.createNewCardTemplate("country to capital");
  const co2caDefaultVariant = co2caTemplate.getDefaultVariant();
  co2caDefaultVariant.setCSS(CSS);
  co2caDefaultVariant.setFront(FRONT.replace("FIELD_ONE", "country"));
  co2caDefaultVariant.setBack(
    BACK.replace("FIELD_ONE", "country").replace("FIELD_TWO", "capital")
  );

  const ca2coTemplate = noteType.createNewCardTemplate("capital to country");
  const ca2coDefaultVariant = ca2coTemplate.getDefaultVariant();
  ca2coDefaultVariant.setCSS(CSS);
  ca2coDefaultVariant.setFront(FRONT.replace("FIELD_ONE", "capital"));
  ca2coDefaultVariant.setBack(
    BACK.replace("FIELD_ONE", "capital").replace("FIELD_TWO", "country")
  );

  await deck.persist();
  console.log(`**** Deck created in ${Date.now() - startTime}ms`);
});

test("delete note field", async () => {
  const startTime = Date.now();
  if (deck === undefined) {
    throw new Error("Deck is undefined");
  }
  const noteType = deck.getAllNoteTypes()[0];
  const field = noteType.getAllFields()[0];
  field.delete();
  await deck.persist();
  console.log(`**** Field deleted in ${Date.now() - startTime}ms`);
});
