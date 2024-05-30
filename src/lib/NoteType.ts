import { NoteField } from './NoteField'
import { CardTemplate } from './CardTemplate'

import { nanoid } from 'nanoid'

import type { ExcludeMethods } from './utils'

export class NoteType {
  id: string
  name: string
  fields: NoteField[] = []
  cards: CardTemplate[] = []

  static createNewDefault() {
    return new NoteType({
      id: nanoid(6),
      name: 'New note type',
      fields: [NoteField.createNew('front'), NoteField.createNew('back')],
      cards: [
        new CardTemplate({
          id: nanoid(6),
          name: 'Default',
          frontTemplate: '{ front }',
          backTemplate: '{ back }'
        })
      ]
    })
  }

  constructor({ id, name, fields, cards }: ExcludeMethods<NoteType>) {
    this.id = id
    this.name = name
    this.fields = fields
    this.cards = cards
  }

  setName(name: string) {
    this.name = name
  }

  setFields(fields: NoteField[]) {
    this.fields = fields
  }

  createNewField() {
    this.fields.unshift(NoteField.createNew())
  }

  deleteField(id: string) {
    this.fields = this.fields.filter((f) => f.id != id)
  }

  setCards(cards: CardTemplate[]) {
    this.cards = cards
  }

  createNewCard() {
    this.cards.unshift(CardTemplate.createNew())
  }

  deleteCard(id: string) {
    this.cards = this.cards.filter((c) => c.id != id)
  }
}
