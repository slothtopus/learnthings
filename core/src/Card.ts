import { PersistableObject } from "./PersistableObject";
import type { PersistedObject } from "./PersistableObject";
import type { ObjectManager } from "./ObjectManager";
import { combineIds } from "./utils/ids";
import { Note } from "./Note";
import { CardTemplate, CardTemplateVariant } from "./CardTemplate";

export type SerialisedCard = {
  cardTemplateId: string;
  noteId: string;
  cardMeta: Record<string, any>;
  cardTemplateVariantId?: string;
} & PersistedObject;

export class Card extends PersistableObject<SerialisedCard> {
  static doctype = "card";
  static subtype = "base";

  shouldPersistIfUnsaved = false;

  cardTemplateId: string;
  cardTemplateVariantId?: string;
  noteId: string;
  get noteTypeId() {
    return (this.objectManager.getObjectById(this.noteId) as Note).noteTypeId;
  }

  get relatedIds() {
    return [this.cardTemplateId, this.noteId];
  }

  cardMeta: Record<string, any>;

  get id() {
    return combineIds([this.noteId, this.cardTemplateId]);
  }

  static createNewEmpty(
    objectManager: ObjectManager,
    options: { cardTemplateId: string; noteId: string }
  ) {
    return new Card(
      {
        ...PersistableObject.create(),
        ...options,
        cardMeta: {},
        cardTemplateVariantId: undefined,
      },
      objectManager
    );
  }

  constructor(serialised: SerialisedCard, objectManager: ObjectManager) {
    super(serialised, objectManager);
    const { cardTemplateId, noteId, cardMeta, cardTemplateVariantId } =
      serialised;
    this.noteId = noteId;
    this.cardTemplateId = cardTemplateId;
    this.cardMeta = cardMeta;
    this.cardTemplateVariantId = cardTemplateVariantId;
  }

  serialise(
    ...args: Parameters<PersistableObject<any>["serialise"]>
  ): SerialisedCard {
    return {
      ...super.serialise(...args),
      noteId: this.noteId,
      cardTemplateId: this.cardTemplateId,
      cardTemplateVariantId: this.cardTemplateVariantId,
      cardMeta: this.cardMeta,
    };
  }

  getNote() {
    return this.objectManager.getObjectById(this.noteId) as Note;
  }

  getCardTemplate() {
    return this.objectManager.getObjectById(
      this.cardTemplateId
    ) as CardTemplate;
  }

  setCardTemplateVariantId(id?: string) {
    this.cardTemplateVariantId = id;
    this.markDirty();
  }

  getCardTemplateVariant() {
    const defaultVariant = this.getCardTemplate().getDefaultVariant();
    if (this.cardTemplateVariantId === undefined) return defaultVariant;

    const variant = this.objectManager.getObjectById(
      this.cardTemplateVariantId
    ) as CardTemplateVariant;
    if (
      variant === undefined ||
      variant.cardTemplateId !== this.cardTemplateId
    ) {
      this.setCardTemplateVariantId(undefined);
      return defaultVariant;
    }

    return variant ?? defaultVariant;
  }

  renderFront(additionalContext: Record<string, string> = {}) {
    const variant = this.getCardTemplateVariant();
    return this.getCardTemplate().renderFront(
      this.getNote(),
      additionalContext,
      variant
    );
  }

  renderBack(additionalContext: Record<string, string> = {}) {
    const variant = this.getCardTemplateVariant();
    return this.getCardTemplate().renderBack(
      this.getNote(),
      additionalContext,
      variant
    );
  }

  getCardMeta(key: string) {
    return this.cardMeta[key];
  }

  setCardMeta(key: string, obj: any) {
    this.cardMeta[key] = obj;
    this.markDirty();
  }

  clearCardMeta(key: string) {
    delete this.cardMeta[key];
    this.markDirty();
  }
}
