import { CardTemplate } from './CardTemplate'
import type { Deck } from './Deck'
import { Note } from './Note'
import { db, type DexiePersistableObject } from './dexieDB'

import { shuffle } from 'lodash-es'
import type { ExcludeMethods } from './utils'
import type { NoteField } from './NoteField'

export type SerialisedCardMeta = ExcludeMethods<CardMeta>

export class CardMeta implements DexiePersistableObject {
  id: string
  deckId: number
  noteId: number
  cardTemplateId: number
  lastCorrectTimestamp: number

  static generateId(noteId: number, cardTemplateId: number) {
    return `${noteId}:${cardTemplateId}`
  }

  static async getKeyedMeta(deckId: number) {
    const serialisedCardMeta = await db.cardMeta.where({ deckId }).toArray()
    const cardMeta = serialisedCardMeta.map((n) => new CardMeta(n))
    return cardMeta.reduce(
      (lookup, cm) => {
        lookup[cm.id] = cm
        return lookup
      },
      {} as Record<string, CardMeta>
    )
  }

  static fromCard(card: Card, lastCorrectTimestamp: number) {
    return new CardMeta({
      deckId: card._parentDeck.id,
      noteId: card.note.id,
      cardTemplateId: card.cardTemplate.id,
      lastCorrectTimestamp
    })
  }

  constructor({
    deckId,
    noteId,
    cardTemplateId,
    lastCorrectTimestamp
  }: Omit<SerialisedCardMeta, 'id'>) {
    this.id = CardMeta.generateId(noteId, cardTemplateId)
    this.deckId = deckId
    this.noteId = noteId
    this.cardTemplateId = cardTemplateId
    this.lastCorrectTimestamp = lastCorrectTimestamp
  }

  serialise(): SerialisedCardMeta {
    return {
      id: this.id,
      deckId: this.deckId,
      noteId: this.noteId,
      cardTemplateId: this.cardTemplateId,
      lastCorrectTimestamp: this.lastCorrectTimestamp
    }
  }

  async persist() {
    await db.cardMeta.put(this.serialise())
  }

  answer(value: number) {
    if (value == 1) {
      this.lastCorrectTimestamp = Date.now()
      this.persist()
    }
  }
}

export class Card {
  _parentDeck: Deck
  note: Note
  fields: NoteField[]
  cardTemplate: CardTemplate
  meta: CardMeta

  constructor(
    parentDeck: Deck,
    {
      note,
      fields,
      cardTemplate,
      meta
    }: {
      note: Note
      fields: NoteField[]
      cardTemplate: CardTemplate
      meta?: CardMeta
    }
  ) {
    this._parentDeck = parentDeck
    this.note = note
    this.fields = fields
    this.cardTemplate = cardTemplate
    this.meta = meta || CardMeta.fromCard(this, 0)
  }

  get id() {
    return `${this.note.id}:${this.cardTemplate.id}`
  }

  render(side: 'front' | 'back') {
    if (side == 'front') {
      return this.cardTemplate.render('front', this.note.populateFields(this.fields))
    } else {
      return this.cardTemplate.render('back', this.note.populateFields(this.fields))
    }
  }

  async answer(value: number) {
    this.meta.answer(value)
  }
}

export type SerialisedScheduler = {
  newCards: number
}

export class Scheduler {
  _parentDeck: Deck
  cards: Card[] = []
  cumWeights: number[] = []
  isInitialised = false

  newCards = 30
  weightPower = 1

  constructor(parentDeck: Deck, { newCards }: SerialisedScheduler) {
    this._parentDeck = parentDeck
    this.newCards = newCards
  }

  async initialiseIfNeeded() {
    if (this.isInitialised) {
      return
    }
    const notes = await Note.service.getNotesForDeck(this._parentDeck.id)
    const cardMetaLookup = await CardMeta.getKeyedMeta(this._parentDeck.id)

    const cards: Card[] = notes.flatMap((note) => {
      if (note.deckId !== this._parentDeck.id) {
        throw new Error(`Note deck id ${note.deckId} mismatch with deck id ${this._parentDeck.id}`)
      }
      const noteType = this._parentDeck.getNoteTypeById(note.noteTypeId)
      if (noteType === undefined) {
        throw new Error(
          `Note type id ${note.noteTypeId} not found in deck id ${this._parentDeck.id}`
        )
      }
      return noteType.cards.map(
        (c) =>
          new Card(this._parentDeck, {
            note,
            cardTemplate: c,
            fields: this._parentDeck.getNoteTypeByIdOrThrow(note.noteTypeId).fields,
            meta: cardMetaLookup[CardMeta.generateId(note.id, c.id)]
          })
      )
    })
    this.cards = cards
    this.markNew()
    this.sortAndWeight()
    this.isInitialised = true
  }

  markNew() {
    const cardsSeen = this.cards.filter((c) => c.meta.lastCorrectTimestamp > 0)
    const cardsNew = shuffle(this.cards.filter((c) => c.meta.lastCorrectTimestamp == 0))

    const oldestSeenTimestamp = Math.min(...cardsSeen.map((c) => c.meta.lastCorrectTimestamp), 0)
    const newestSeenTimestamp = Math.max(...cardsSeen.map((c) => c.meta.lastCorrectTimestamp), 0)

    cardsNew.forEach((c, i) => {
      c.meta = CardMeta.fromCard(
        c,
        i < this.newCards ? oldestSeenTimestamp : newestSeenTimestamp + 1
      )
    })
    this.cards = cardsNew.concat(cardsSeen)
    this.sortAndWeight()
  }

  sortAndWeight() {
    this.cards.sort((a, b) => a.meta.lastCorrectTimestamp - b.meta.lastCorrectTimestamp)

    this.cumWeights = []

    let weightSum = 0
    let currentWeight = 0
    let lastTimestamp = -1

    for (const card of this.cards) {
      const thisTimestamp = card.meta.lastCorrectTimestamp
      if (lastTimestamp < thisTimestamp) {
        currentWeight += 1
      }
      weightSum += 1 / Math.pow(currentWeight, this.weightPower)
      this.cumWeights.push(weightSum)
      lastTimestamp = thisTimestamp
    }
  }

  getNextCardIds() {
    const maxWeight = this.cumWeights[this.cumWeights.length - 1]
    const randomVal = Math.random() * maxWeight

    const bounds = [0, 0]
    let i = 0
    for (i = 0; i < this.cumWeights.length; i++) {
      bounds[0] = bounds[1]
      bounds[1] = this.cumWeights[i]
      if (randomVal > bounds[0] && randomVal <= bounds[1]) {
        break
      }
    }

    const card = this.cards[i]
    return { deckId: this._parentDeck.id, cardId: card.id }
  }

  getCardOrThrow(id: string) {
    const card = this.cards.find((c) => c.id == id)
    if (card === undefined) {
      throw new Error(`Card id ${id} not found`)
    }
    return card
  }

  answer(card: Card, value: number) {
    card.answer(value)
    this.sortAndWeight()
  }
}
