import { NoteField } from './NoteField'
import type { SerialisedNoteField } from './NoteField'

import { CardTemplate } from './CardTemplate'
import type { SerialisedCardTemplate } from './CardTemplate'

import type { PersistableObject } from './loader'

import { nanoid } from 'nanoid'
import type { Deck } from './Deck'

export type SerialisedNoteType = {
  id: string
  name: string
  fields: SerialisedNoteField[]
  cards: SerialisedCardTemplate[]
}

export class NoteType implements PersistableObject {
  id: string
  name: string
  fields: NoteField[]
  cards: CardTemplate[] = []

  _parentDeck: Deck

  /*static createPlaceholder() {
    return new NoteType({
      id: '...',
      name: '...',
      fields: [],
      cards: []
    })
  }*/

  static async createNewDefault(parentDeck: Deck) {
    const newNoteType = new NoteType(parentDeck, {
      id: nanoid(6),
      name: 'New note type',
      fields: [
        NoteField.createNewDefault(parentDeck, 'front'),
        NoteField.createNewDefault(parentDeck, 'back')
      ],
      cards: [
        new CardTemplate(parentDeck, {
          id: nanoid(6),
          name: 'Default',
          frontTemplate: '{ front }',
          backTemplate: '{ back }'
        })
      ]
    })
    return newNoteType
  }

  constructor(parentDeck: Deck, { id, name, fields, cards }: SerialisedNoteType) {
    this._parentDeck = parentDeck
    this.id = id
    this.name = name
    this.fields = fields.map((f) => new NoteField(parentDeck, f))
    this.cards = cards.map((c) => new CardTemplate(parentDeck, c))
  }

  setName(name: string) {
    this.name = name
    this.persist()
  }

  createNewField() {
    const newField = new NoteField(this._parentDeck, {
      id: 'sameid',
      name: 'New field',
      mimeType: 'text/plain'
    })
    this.fields.unshift(newField)
    this.persist()
  }

  deleteField(id: string) {
    this.fields = this.fields.filter((field) => field.id != id)
    this.persist()
  }

  setFields(fields: NoteField[]) {
    this.fields = fields
    this.persist()
  }

  setCards(cards: CardTemplate[]) {
    this.cards = cards
    this.persist()
  }

  createNewCard() {
    this.cards.unshift(CardTemplate.createNewDefault(this._parentDeck))
    this.persist()
  }

  deleteCard(id: string) {
    this.cards = this.cards.filter((c) => c.id != id)
    this.persist()
  }

  serialise(): SerialisedNoteType {
    return {
      id: this.id,
      name: this.name,
      fields: this.fields.map((f) => f.serialise()),
      cards: this.cards.map((c) => c.serialise())
    }
  }

  async persist() {
    await this._parentDeck.persist()
  }
}
