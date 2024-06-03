import { NoteField } from './NoteField'
import { CardTemplate } from './CardTemplate'
import { AsyncCollection } from './loader'

import { nanoid } from 'nanoid'

import type { ExcludeMethods } from './utils'

export type SerialisedNoteType = {
  id: string
  name: string
  fieldIds: string[]
  cards: CardTemplate[]
}
export class NoteType {
  id: string
  name: string
  fields: AsyncCollection<NoteField>
  //fieldIds: string[] = []
  //fieldObjects: Record<string, AsyncLoader<NoteField>>
  cards: CardTemplate[] = []

  static createNewDefault() {
    const newNoteType = new NoteType({
      id: nanoid(6),
      name: 'New note type',
      fieldIds: [],
      cards: [
        new CardTemplate({
          id: nanoid(6),
          name: 'Default',
          frontTemplate: '{ front }',
          backTemplate: '{ back }'
        })
      ]
    })
    newNoteType.fields = AsyncCollection.fromData([
      NoteField.createNewDefault('front'),
      NoteField.createNewDefault('back')
    ])
    return newNoteType
  }

  constructor({ id, name, fieldIds, cards }: SerialisedNoteType) {
    this.id = id
    this.name = name
    this.fields = new AsyncCollection<NoteField>(fieldIds, { loader: NoteField.service.getOne })
    this.cards = cards
  }

  setName(name: string) {
    this.name = name
  }

  setFields(fields: NoteField[]) {
    throw 'setFields not implemented'
    //this.fields = fields
  }

  createNewField() {
    throw 'createNewField not implemented'
    //this.fields.unshift(NoteField.createNewDefault())
  }

  deleteField(id: string) {
    throw 'deleteField not implemented'
    //this.fields = this.fields.filter((f) => f.id != id)
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
