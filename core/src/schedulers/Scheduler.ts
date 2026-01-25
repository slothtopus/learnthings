import type { Card } from "../Card";
import type { DateTime } from "luxon";
import { PersistableObject, PersistedObject } from "../PersistableObject";

export abstract class Scheduler<
  S extends PersistedObject
> extends PersistableObject<S> {
  get label() {
    return "Base Scheduler";
  }
  abstract nextCard(): Card;
  abstract cardRated(
    ratedCard: Card,
    ratingValue: number,
    ratedAt?: DateTime<true>
  ): Promise<void>;
}
