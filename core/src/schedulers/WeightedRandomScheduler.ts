import { DateTime } from "luxon";

import { PersistableObject } from "../object_manager/PersistableObject";
import type { PersistedObject } from "../object_manager/PersistableObject";
import type { ObjectManager } from "../object_manager/ObjectManager";
import type { Card } from "../Card";
import { Scheduler } from "./Scheduler";

const META_KEY = "weighted_random_v1";

// Cards unseen or unseen for >30 days get equal max weight
const MAX_WEIGHT_HOURS = 24 * 30;

type CardMeta = { lastReview?: string; lastIncorrect?: boolean };

function cardWeight(card: Card): number {
  const meta = card.getCardMeta(META_KEY) as CardMeta | undefined;
  if (!meta?.lastReview || meta.lastIncorrect) return MAX_WEIGHT_HOURS;
  const hours = DateTime.now()
    .diff(DateTime.fromISO(meta.lastReview))
    .as("hours");
  // Floor at 0.1 so a just-rated card still has a tiny chance
  return Math.min(Math.max(hours, 0.1), MAX_WEIGHT_HOURS);
}

function weightedRandomIndex(weights: number[]): number {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

export type SerialisedWeightedRandom = PersistedObject;

export class WeightedRandomScheduler extends Scheduler<SerialisedWeightedRandom> {
  static doctype = "scheduler" as const;
  static subtype = "weighted_random" as const;
  static label = "Weighted Random";
  shouldPersistIfUnsaved = true;

  get label() {
    return WeightedRandomScheduler.label;
  }

  private cards: Card[] = [];

  shouldDelete() {
    return super.shouldDelete() || this.deck.activeSchedulerId !== this.id;
  }

  static createNew(objectManager: ObjectManager) {
    return new WeightedRandomScheduler(
      PersistableObject.create(),
      objectManager
    );
  }

  serialise(
    ...args: Parameters<PersistableObject<any>["serialise"]>
  ): SerialisedWeightedRandom {
    return super.serialise(...args);
  }

  initialise(cards: Card[]) {
    this.cards = cards;
  }

  nextCard(): Card {
    if (this.cards.length === 0) throw new Error("No cards available");
    const weights = this.cards.map(cardWeight);
    return this.cards[weightedRandomIndex(weights)];
  }

  async cardRated(
    card: Card,
    value: number,
    ratedAt: DateTime<true> = DateTime.now() as DateTime<true>
  ) {
    const meta: CardMeta = {
      lastReview: ratedAt.toISO(),
      lastIncorrect: value === 0,
    };
    card.setCardMeta(META_KEY, meta);
    await this.deck.persist();
  }

  getStatistics(cards: Card[]) {
    const now = DateTime.now();
    let unseen = 0;
    let recentlySeen = 0;
    let seen = 0;

    for (const card of cards) {
      const meta = card.getCardMeta(META_KEY) as CardMeta | undefined;
      if (!meta?.lastReview || meta.lastIncorrect) {
        unseen++;
      } else {
        const hours = now.diff(DateTime.fromISO(meta.lastReview)).as("hours");
        if (hours < 24) recentlySeen++;
        else seen++;
      }
    }

    return { total: cards.length, unseen, recentlySeen, seen };
  }
}
