import {
  createEmptyCard,
  fsrs,
  Rating as FSRSRating,
  generatorParameters,
} from "ts-fsrs";
import type {
  Card as FSRSCard,
  CardInput as FSRSCardInput,
  State as FSRSState,
  FSRS,
  Grade as FSRSGrade,
  FSRSParameters,
} from "ts-fsrs";

import { DateTime } from "luxon";

import { PersistableObject } from "../PersistableObject";
import type { PersistedObject } from "../PersistableObject";
import type { ObjectManager } from "../ObjectManager";
import type { Card } from "../Card";
import { Scheduler } from "./Scheduler";

export type SerialisedFSRSCardMeta = {
  due: string;
  difficulty: number;
  lastReview?: string;
  reps: number;
  lapses: number;
  state: number;
  stability: number;
};

export class FSRSCardMeta {
  static metaKey = "fsrs_v2";

  card: Card;
  order: number | undefined;

  due: DateTime<true>;
  difficulty: number;
  lastReview?: DateTime<true>;
  reps: number;
  lapses: number;
  state: FSRSState;
  stability: number;

  _dueOffsetMillis = 0;

  static fromCardIfExists(card: Card) {
    const existingSerialisedMeta = card.getCardMeta(FSRSCardMeta.metaKey);
    if (existingSerialisedMeta === undefined) {
      return undefined;
    } else {
      return new FSRSCardMeta(existingSerialisedMeta, card);
    }
  }

  static createEmpty(card: Card) {
    const emptyCard = createEmptyCard();
    return FSRSCardMeta.fromFSRSCard(emptyCard, card);
  }

  static fromFSRSCard(fsrsCard: FSRSCard, card: Card) {
    return new FSRSCardMeta(
      {
        due: fsrsCard.due.toISOString(),
        difficulty: fsrsCard.difficulty,
        lastReview: fsrsCard.last_review?.toISOString(),
        reps: fsrsCard.reps,
        lapses: fsrsCard.lapses,
        state: fsrsCard.state,
        stability: fsrsCard.stability,
      },
      card
    );
  }

  static sortByOrder(cards: FSRSCardMeta[]) {
    return cards.toSorted((a, b) => {
      if (a.order === undefined && b.order === undefined) return 0;
      if (a.order === undefined) return 1;
      if (b.order === undefined) return -1;
      return a.order - b.order;
    });
  }

  constructor(
    {
      due,
      difficulty,
      lastReview,
      reps,
      lapses,
      state,
      stability,
    }: SerialisedFSRSCardMeta,
    card: Card
  ) {
    this.due = DateTime.fromISO(due) as DateTime<true>;
    this.lastReview = lastReview
      ? (DateTime.fromISO(lastReview) as DateTime<true>)
      : undefined;
    this.difficulty = difficulty;
    this.reps = reps;
    this.lapses = lapses;
    this.state = state;
    this.stability = stability;

    this.card = card;
  }

  updateFromFSRSCard(fsrsCard: FSRSCard) {
    this.due = DateTime.fromJSDate(fsrsCard.due) as DateTime<true>;
    this.difficulty = fsrsCard.difficulty;
    this.lastReview = fsrsCard.last_review
      ? (DateTime.fromJSDate(fsrsCard.last_review) as DateTime<true>)
      : undefined;
    this.reps = fsrsCard.reps;
    this.lapses = fsrsCard.lapses;
    this.state = fsrsCard.state;
    this.stability = fsrsCard.stability;
  }

  toFSRSCard(currentDate: DateTime<true>): FSRSCardInput {
    return {
      due: this.due.toISODate(),
      last_review: this.lastReview?.toISODate(),
      elapsed_days: this.lastReview
        ? currentDate.diff(this.lastReview).as("days")
        : 0,
      scheduled_days: currentDate.diff(this.due).as("days"),
      reps: this.reps,
      lapses: this.lapses,
      difficulty: this.difficulty,
      stability: this.stability,
      state: this.state,
    };
  }

  serialise(): SerialisedFSRSCardMeta {
    return {
      due: this.due.toISO(),
      difficulty: this.difficulty,
      lastReview: this.lastReview?.toISO(),
      reps: this.reps,
      lapses: this.lapses,
      state: this.state,
      stability: this.stability,
    };
  }

  isDue(currentDate: DateTime<true>) {
    return this.due.toMillis() <= currentDate.toMillis();
  }

  isNew() {
    return this.lastReview === undefined;
  }
}

export type FSRSSequenceOptions = {
  maxLapses: number;
  dueTimeOffset: number;
};

export const DEFAULT_OPTIONS: FSRSSequenceOptions = {
  maxLapses: 2,
  dueTimeOffset: 60,
};

export type SerialisedFSRSSequence = PersistedObject & {
  options: FSRSSequenceOptions;
  parameters: FSRSParameters;
};

export class FSRSSequence extends Scheduler<SerialisedFSRSSequence> {
  static doctype = "scheduler" as const;
  static subtype = "fsrs_sequence" as const;
  shouldPersistIfUnsaved = true;

  static label = "FSRS Sequence Scheduler";
  get label() {
    return FSRSSequence.label;
  }

  options: FSRSSequenceOptions;
  parameters: FSRSParameters;

  allCards: FSRSCardMeta[] = [];
  allCardsByCardId: Record<string, FSRSCardMeta> = {};

  fsrs: FSRS;

  _lapses = 0;
  _currentCardIndex: number | undefined;

  static createNew(objectManager: ObjectManager) {
    return new FSRSSequence(
      {
        ...PersistableObject.create(),
        options: { ...DEFAULT_OPTIONS },
        parameters: generatorParameters(),
      },
      objectManager
    );
  }

  constructor(
    serialised: SerialisedFSRSSequence,
    objectManager: ObjectManager
  ) {
    super(serialised, objectManager);
    const { options, parameters } = serialised;
    this.options = options;
    this.parameters = parameters;
    this.fsrs = fsrs(parameters);
  }

  serialise(
    ...args: Parameters<PersistableObject<any>["serialise"]>
  ): SerialisedFSRSSequence {
    return {
      ...super.serialise(...args),
      options: this.options,
      parameters: this.parameters,
    };
  }

  getMetaKey(): string {
    return FSRSCardMeta.metaKey;
  }

  getCardMetaOrThrow(card: Card) {
    if (card.id in this.allCardsByCardId) {
      return this.allCardsByCardId[card.id];
    } else {
      throw new Error(`Card meta for card ${card.id} does not exist`);
    }
  }

  setCards(cards: Card[]) {
    this.allCardsByCardId = cards.reduce((allCardsByCardId, card) => {
      const cardMeta =
        FSRSCardMeta.fromCardIfExists(card) || FSRSCardMeta.createEmpty(card);

      cardMeta.order = card.getNote().order;

      allCardsByCardId[card.id] = cardMeta;
      return allCardsByCardId;
    }, {} as Record<string, FSRSCardMeta>);

    this.allCards = FSRSCardMeta.sortByOrder([
      ...Object.values(this.allCardsByCardId),
    ]);
  }

  initialise(cards: Card[]) {
    this.setCards(cards);
  }

  nextCard() {
    let nextIndex;
    if (
      this._currentCardIndex === undefined ||
      this._lapses >= this.options.maxLapses
    ) {
      console.log(
        "Resetting to earliest due: now =",
        DateTime.now()
          .plus({ minutes: this.options.dueTimeOffset })
          .toFormat("yyyy-LL-dd HH:mm:ss")
      );
      // find the earliest due card to start at
      nextIndex = this.allCards.findIndex((c) =>
        c.isDue(DateTime.now().plus({ minutes: this.options.dueTimeOffset }))
      );

      // If no cards due, find the card with the earliest due date
      if (nextIndex == -1) {
        const dueMillis = this.allCards.map((c) => c.due.toMillis());
        const earliestDue = Math.min(...dueMillis);
        nextIndex = dueMillis.findIndex((x) => x === earliestDue);
        console.log(
          `No cards due. Choosing card with earliest due date (due = ${this.allCards[nextIndex].due})`
        );
      } else {
        console.log(
          `Choosing earliest due card (due = ${this.allCards[nextIndex].due})`
        );
      }

      nextIndex = Math.max(0, nextIndex);
      this._lapses = 0;
    } else {
      console.log("Moving to next card");
      nextIndex = (this._currentCardIndex + 1) % this.allCards.length;
    }
    this._currentCardIndex = nextIndex;
    const cardMeta = this.allCards[nextIndex];
    console.log(`Found card ${cardMeta.card.id}: due ${cardMeta.due}`);
    return this.allCards[nextIndex].card;
  }

  async cardRated(
    ratedCard: Card,
    ratingValue: number,
    ratedAt = DateTime.now()
  ) {
    const cardMeta = this.getCardMetaOrThrow(ratedCard);
    this.markDirty();

    let rating: FSRSGrade;

    if (ratingValue <= 0) {
      rating = FSRSRating.Again;
      this._lapses += 1;
    } else if (ratingValue > 0 && ratingValue < 0.5) {
      rating = FSRSRating.Hard;
    } else if (ratingValue >= 0.5 && ratingValue < 1) {
      rating = FSRSRating.Good;
    } else {
      rating = FSRSRating.Easy;
    }

    if (cardMeta.isDue(ratedAt.plus({ minutes: this.options.dueTimeOffset }))) {
      const { card } = this.fsrs.next(
        cardMeta.toFSRSCard(ratedAt),
        ratedAt.toISO(),
        rating
      );

      console.log(
        `card ${ratedCard.id}: rated ${ratingValue} @ ${ratedAt.toFormat(
          "yyyy-LL-dd HH:mm:ss"
        )}`
      );
      console.log("before update:", cardMeta.serialise());
      cardMeta.updateFromFSRSCard(card);
      console.log(`after update:`, cardMeta.serialise());

      ratedCard.setCardMeta(FSRSCardMeta.metaKey, cardMeta.serialise());
      await this.deck.persist();
    } else {
      console.log("Not rated because not due");
    }
    await this.deck.persist();
  }
}
