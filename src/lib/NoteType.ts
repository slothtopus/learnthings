import { NoteField } from './NoteField'
import { CardTemplate } from './CardTemplate'

import type { ExcludeMethods } from './utils'

export class NoteType {
  id: string
  fields: NoteField[] = []
  cards: CardTemplate[] = []

  static createNewDefault() {
    return new NoteType({
      id: String(Date.now()),
      fields: [new NoteField('front'), new NoteField('back')],
      cards: [
        new CardTemplate({ name: 'Default', frontTemplate: '{ front }', backTemplate: '{ back }' })
      ]
    })
  }

  constructor({ id, fields, cards }: ExcludeMethods<NoteType>) {
    this.id = id
    this.fields = fields
    this.cards = cards
  }
}
