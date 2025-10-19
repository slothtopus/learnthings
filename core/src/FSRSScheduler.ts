import type {
  Card as FSRSCard,
  CardInput as FSRSCardInput,
  State as FSRSState,
  FSRS,
  Grade as FSRSGrade,
  FSRSParameters,
} from "ts-fsrs";
import type { Card } from "./Card";
import { floorDateTime } from "./utils/time";

import { DateTime } from "luxon";
import { sample, shuffle } from "lodash-es";
import {
  createEmptyCard,
  fsrs,
  Rating as FSRSRating,
  generatorParameters,
} from "ts-fsrs";
import { PersistableObject, PersistedObject } from "./PersistableObject";
import type { ObjectManager } from "./ObjectManager";

export enum SchedulerErrorType {
  NO_CARDS_LEFT = "NO_CARDS_LEFT",
}

export class SchedulerError extends Error {
  public readonly type: SchedulerErrorType;

  constructor(type: SchedulerErrorType, message?: string) {
    super(message || type);
    this.type = type;

    // Set the prototype explicitly for compatibility with instanceof
    Object.setPrototypeOf(this, SchedulerError.prototype);
  }
}

export type SchedulerStatistics = {
  due: { new: number; seen: number };
  not_due: { new: number; seen: number };
};

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
  static metaKey = "fsrs_v1";

  card: Card;
  scheduler: FSRSScheduler;
  lastReviewSequence = -Infinity;
  order: number | undefined;

  due: DateTime<true>;
  difficulty: number;
  lastReview?: DateTime<true>;
  reps: number;
  lapses: number;
  state: FSRSState;
  stability: number;

  _dueOffsetMillis = 0;

  static fromCardIfExists(card: Card, scheduler: FSRSScheduler) {
    const existingSerialisedMeta = card.getCardMeta(FSRSCardMeta.metaKey);
    if (existingSerialisedMeta === undefined) {
      return undefined;
    } else {
      return new FSRSCardMeta(existingSerialisedMeta, card, scheduler);
    }
  }

  static createEmpty(card: Card, scheduler: FSRSScheduler) {
    const emptyCard = createEmptyCard(ReviewSession.timeService().toISO());
    return FSRSCardMeta.fromFSRSCard(emptyCard, card, scheduler);
  }

  static fromFSRSCard(
    fsrsCard: FSRSCard,
    card: Card,
    scheduler: FSRSScheduler
  ) {
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
      card,
      scheduler
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
    card: Card,
    scheduler: FSRSScheduler
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
    this.scheduler = scheduler;
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

  getDue() {
    const offsetDue = DateTime.fromMillis(
      this.due.toMillis() - this._dueOffsetMillis
    ) as DateTime<true>;
    return floorDateTime(offsetDue, {
      minutes: this.scheduler.options.floorDueDateMinutes,
    });
  }

  isDue(currentDate: DateTime<true>) {
    return this.getDue().toMillis() <= currentDate.toMillis();
  }

  isNew() {
    return this.lastReview === undefined;
  }
}

export type ReviewSessionDetails = {
  sessionStartedAt: DateTime<true>;
  startedAtSequenceCount: number;
  newCardsSeen: number;
};

export type SerialisedReviewSession = {
  reviewSequenceCount: number;
  sessionStartedAt: string;
  startedAtSequenceCount: number;
  newCardsSeen: number;
};

export class ReviewSession {
  reviewSequenceCount: number;
  sessionStartedAt: DateTime<true>;
  startedAtSequenceCount: number;
  newCardsSeen: number;

  static timeService = () => DateTime.now();

  static createNew() {
    return new ReviewSession({
      reviewSequenceCount: 0,
      sessionStartedAt: ReviewSession.timeService().toISO(),
      startedAtSequenceCount: 0,
      newCardsSeen: 0,
    });
  }

  constructor({
    reviewSequenceCount,
    sessionStartedAt,
    startedAtSequenceCount,
    newCardsSeen,
  }: SerialisedReviewSession) {
    this.reviewSequenceCount = reviewSequenceCount;
    this.sessionStartedAt = DateTime.fromISO(
      sessionStartedAt
    ) as DateTime<true>;
    this.startedAtSequenceCount = startedAtSequenceCount;
    this.newCardsSeen = newCardsSeen;
  }

  initialiseSession() {
    const currentTime = ReviewSession.timeService();
    if (this.sessionStartedAt.toISODate() != currentTime.toISODate()) {
      this.sessionStartedAt = currentTime;
      this.startedAtSequenceCount = this.reviewSequenceCount;
      this.newCardsSeen = 0;
    }
  }

  serialise(): SerialisedReviewSession {
    return {
      reviewSequenceCount: this.reviewSequenceCount,
      sessionStartedAt: this.sessionStartedAt.toISO(),
      startedAtSequenceCount: this.startedAtSequenceCount,
      newCardsSeen: this.newCardsSeen,
    };
  }
}

export enum ReviewSessionStatus {
  UNSTARTED = "UNSTARTED",
  NEW_SESSION = "NEW_SESSION",
  IN_PROGRESS = "IN_PROGRESS",
  SESSION_COMPLETE = "SESSION_COMPLETE",
}

export type FRSROptions = {
  // how many cards should be introduced each session in addition to reviewed cards that are due
  newCardsPerSession: number;
  // minimum gap in reviews before a card can be seen again
  minReviewInterval: number;
  // Used to floor the due dates
  floorDueDateMinutes: number;
  // only rate cards if they were actually due
  onlyRateIfDue: boolean;
};

export const DEFAULT_OPTIONS: FRSROptions = {
  newCardsPerSession: 5,
  minReviewInterval: 3,
  floorDueDateMinutes: 15,
  onlyRateIfDue: true,
};

export type SerialisedFSRSScheduler = PersistedObject & {
  options: FRSROptions;
  parameters: FSRSParameters;
  currentSession: SerialisedReviewSession;
};

export class FSRSScheduler extends PersistableObject<SerialisedFSRSScheduler> {
  static doctype = "scheduler";
  static subtype = "fsrs";
  shouldPersistIfUnsaved = true;

  options: FRSROptions;
  parameters: FSRSParameters;

  allCards: FSRSCardMeta[] = [];
  allCardsByCardId: Record<string, FSRSCardMeta> = {};

  currentSession: ReviewSession;
  sessionCards: FSRSCardMeta[] = [];

  fsrs: FSRS;

  static createNewEmpty(objectManager: ObjectManager) {
    return new FSRSScheduler(
      {
        ...PersistableObject.create(),
        options: { ...DEFAULT_OPTIONS },
        parameters: generatorParameters(),
        currentSession: ReviewSession.createNew().serialise(),
      },
      objectManager
    );
  }

  constructor(
    serialised: SerialisedFSRSScheduler,
    objectManager: ObjectManager
  ) {
    super(serialised, objectManager);
    const { options, parameters, currentSession } = serialised;
    this.options = options;
    this.parameters = parameters;
    this.currentSession = new ReviewSession(currentSession);
    this.fsrs = fsrs(parameters);
  }

  serialise(includeObjects = true): SerialisedFSRSScheduler {
    return {
      ...super.serialise(includeObjects),
      options: this.options,
      parameters: this.parameters,
      currentSession: this.currentSession.serialise(),
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

  updateOptions(options: Partial<FRSROptions>) {
    this.options = Object.assign(this.options, options);
  }

  getStatistics(cards: Card[]): SchedulerStatistics {
    this.currentSession.initialiseSession();

    const newRemaining = Math.max(
      this.options.newCardsPerSession - this.currentSession.newCardsSeen,
      0
    );
    const cardMeta = cards.map(
      (c) =>
        FSRSCardMeta.fromCardIfExists(c, this) ||
        FSRSCardMeta.createEmpty(c, this)
    );
    const stats = this.getCardStats(cardMeta, DateTime.now());

    return {
      due: { new: Math.min(stats.new, newRemaining), seen: stats.due },
      not_due: {
        new: Math.max(0, stats.new - newRemaining),
        seen: stats.notDue,
      },
    };
  }

  setCards(cards: Card[]) {
    this.allCardsByCardId = cards.reduce((allCardsByCardId, card) => {
      const cardMeta =
        FSRSCardMeta.fromCardIfExists(card, this) ||
        FSRSCardMeta.createEmpty(card, this);

      cardMeta.order = card.getNote().order;

      allCardsByCardId[card.id] = cardMeta;
      return allCardsByCardId;
    }, {} as Record<string, FSRSCardMeta>);

    this.allCards = [...Object.values(this.allCardsByCardId)];
  }

  initialise(cards: Card[]) {
    this.resetSessionCards();
    this.currentSession.initialiseSession();
    this.setCards(cards);
    this.prepareSessionCards();
  }

  getCardStats(cardMetas: FSRSCardMeta[], dueAt: DateTime<true>) {
    return cardMetas.reduce(
      (stats, cardMeta) => {
        if (cardMeta.isNew()) {
          stats.new += 1;
        } else if (cardMeta.isDue(dueAt)) {
          stats.due += 1;
        } else {
          stats.notDue += 1;
        }
        return stats;
      },
      { new: 0, notDue: 0, due: 0 }
    );
  }

  addDueCardsToSession(dueAt = ReviewSession.timeService()) {
    const dueCards = this.allCards.filter((c) => !c.isNew() && c.isDue(dueAt));
    this.sessionCards = this.sessionCards.concat(dueCards);
  }

  addNewCardsToSession(n: number) {
    const newCards = this.allCards.filter((c) => c.isNew());
    const sortedNewCards = FSRSCardMeta.sortByOrder(newCards);
    const selectedNewCards = sortedNewCards.slice(0, n);

    if (selectedNewCards.length < n) {
      console.warn(
        `addNewCardsToSession(${n}): can only add ${selectedNewCards.length} new cards to session`
      );
    }
    this.sessionCards = this.sessionCards.concat(selectedNewCards);
  }

  prepareSessionCards() {
    this.addDueCardsToSession();
    this.addNewCardsToSession(
      Math.max(
        this.options.newCardsPerSession - this.currentSession.newCardsSeen,
        0
      )
    );
  }

  resetSessionCards() {
    this.sessionCards.forEach((c) => (c._dueOffsetMillis = 0));
    this.sessionCards = [];
  }

  nextCard() {
    const dueAt = ReviewSession.timeService();
    const eligibleCards = this.sessionCards.filter((c) => c.isDue(dueAt));
    let filteredEligibleCards = [...eligibleCards];

    console.log(
      `nextCard(): reviewSequenceCount = ${this.currentSession.reviewSequenceCount}`
    );
    /*console.log(
      `eligibleCards ${eligibleCards.length}:`,
      eligibleCards.forEach((c) =>
        console.log(
          `${c.card.getId()}: due = ${c.getDue().toISO()}, sequence = ${
            c.lastReviewSequence
          }`
        )
      )
    );*/

    if (eligibleCards.length == 0) {
      this.resetSessionCards();
      throw new SchedulerError(SchedulerErrorType.NO_CARDS_LEFT);
    }

    /*const minReviewInterval = Math.min(
      this.options.minReviewInterval,
      this.sessionCards.length - 1
    );*/
    const cardRespectsInterval = (lastReviewSequence: number) =>
      this.currentSession.reviewSequenceCount - lastReviewSequence >=
      this.options.minReviewInterval;

    filteredEligibleCards = eligibleCards.filter((c) =>
      cardRespectsInterval(c.lastReviewSequence)
    );

    /*console.log(
      `After review interval filter (${filteredEligibleCards.length}):`,
      filteredEligibleCards.forEach((c) =>
        console.log(
          `${c.card.getId()}: due = ${c.getDue().toISO()}, sequence = ${
            c.lastReviewSequence
          }`
        )
      )
    );*/

    // if we don't have any cards, first try to add some session not due
    // that respect the min review interval
    if (filteredEligibleCards.length == 0) {
      const nonEligibleSessionCards = shuffle(
        this.sessionCards.filter(
          (c) => !c.isDue(dueAt) && cardRespectsInterval(c.lastReviewSequence)
        )
      );

      if (nonEligibleSessionCards.length > 0) {
        filteredEligibleCards.push(nonEligibleSessionCards[0]);
      }

      /*console.log(
        `After adding session not due (${filteredEligibleCards.length}):`,
        filteredEligibleCards.forEach((c) =>
          console.log(
            `${c.card.getId()}: due = ${c.getDue().toISO()}, sequence = ${
              c.lastReviewSequence
            }`
          )
        )
      );*/
    }

    // if we don't have any cards, first try to add some non session not due
    // that respect the min review interval
    if (filteredEligibleCards.length == 0) {
      const notEligibleNonSessionCards = this.allCards.filter(
        (c) => !c.isDue(dueAt) && cardRespectsInterval(c.lastReviewSequence)
      );
      if (notEligibleNonSessionCards.length > 0) {
        filteredEligibleCards.push(notEligibleNonSessionCards[0]);
      }

      /*console.log(
        `After adding non session not due (${filteredEligibleCards.length}):`,
        filteredEligibleCards.forEach((c) =>
          console.log(
            `${c.card.getId()}: due = ${c.getDue().toISO()}, sequence = ${
              c.lastReviewSequence
            }`
          )
        )
      );*/
    }

    // if we still don't have any cards, reset to eligible to ensure at least one card
    // is available
    if (filteredEligibleCards.length == 0) {
      filteredEligibleCards = eligibleCards;
    }

    let chosenCard = sample(filteredEligibleCards) as FSRSCardMeta;
    // if we chose a new card and our new cards are sorted, swap it with
    // the lowest order
    if (
      chosenCard.isNew() &&
      filteredEligibleCards.some((c) => c.order !== undefined)
    ) {
      chosenCard = FSRSCardMeta.sortByOrder(
        filteredEligibleCards.filter((c) => c.isNew())
      )[0];
    }

    return chosenCard.card;
  }

  async cardDisplayed(
    displayedCard: Card,
    displayedAt = ReviewSession.timeService()
  ) {
    return;
  }

  async cardFlipped(
    flippedCard: Card,
    flippedAt = ReviewSession.timeService()
  ) {
    return;
  }

  async cardRated(
    ratedCard: Card,
    ratingValue: number,
    ratedAt = ReviewSession.timeService()
  ) {
    this.currentSession.reviewSequenceCount += 1;
    const cardMeta = this.getCardMetaOrThrow(ratedCard);
    cardMeta.lastReviewSequence = this.currentSession.reviewSequenceCount;
    if (cardMeta.isNew()) {
      this.currentSession.newCardsSeen += 1;
    }
    this.markDirty();

    let rating: FSRSGrade;

    if (ratingValue <= 0) {
      rating = FSRSRating.Again;
    } else if (ratingValue > 0 && ratingValue < 0.5) {
      rating = FSRSRating.Hard;
    } else if (ratingValue >= 0.5 && ratingValue < 1) {
      rating = FSRSRating.Good;
    } else {
      rating = FSRSRating.Easy;
    }

    if (cardMeta.isDue(ratedAt) || !this.options.onlyRateIfDue) {
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
