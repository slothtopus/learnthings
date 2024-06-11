import { NoteField } from './NoteField'
import type { SerialisedNoteField } from './NoteField'

import { CardTemplate } from './CardTemplate'
import type { SerialisedCardTemplate } from './CardTemplate'

import type { Note } from './Note'

import type { DexiePersistableObject } from './dexieDB'

import type { Deck } from './Deck'

export type SerialisedNoteType = {
  id: number
  name: string
  fields: SerialisedNoteField[]
  cards: SerialisedCardTemplate[]
}

export class NoteType implements DexiePersistableObject {
  id: number
  name: string
  fields: NoteField[]
  cards: CardTemplate[] = []

  _parentDeck: Deck

  static async createNewDefault(parentDeck: Deck) {
    const newNoteType = new NoteType(parentDeck, {
      id: parentDeck.getNextInternalId(),
      name: 'New note type',
      fields: [
        NoteField.createNewDefault(parentDeck, 'front'),
        NoteField.createNewDefault(parentDeck, 'back')
      ],
      cards: [
        new CardTemplate(parentDeck, {
          id: parentDeck.getNextInternalId(),
          name: 'Default',
          frontTemplate: '{ front }',
          backTemplate: '{ back }',
          css: ''
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
    this.fields.unshift(NoteField.createNewDefault(this._parentDeck, 'New field'))
    this.persist()
  }

  deleteField(id: number) {
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

  deleteCard(id: number) {
    this.cards = this.cards.filter((c) => c.id != id)
    this.persist()
  }

  getCardTemplateById(id: number) {
    return this.cards.find((c) => c.id == id)
  }

  getSearchField() {
    return this.fields[0]
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

  generateCards(note: Note) {
    const templateFields = note.populateFields(this.fields)
    return this.cards.map((card) => ({
      front: card.render('front', templateFields),
      back: card.render('back', templateFields)
    }))
  }
}
