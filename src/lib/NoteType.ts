import { NoteField } from './NoteField'
import { CardTemplate } from './CardTemplate'
import { AsyncCollection, wrapPersistanceProxy } from './loader'

import { nanoid } from 'nanoid'

import type { ExcludeMethods } from './utils'

export type SerialisedNoteType = {
  id: string
  name: string
  field_ids: string[]
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
      field_ids: [],
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

    console.log(newNoteType)
    return newNoteType
  }

  constructor({ id, name, field_ids, cards }: SerialisedNoteType) {
    this.id = id
    this.name = name
    this.fields = new AsyncCollection<NoteField>(field_ids)
    this.cards = cards
  }

  setName(name: string) {
    this.name = name
  }

  createNewField() {
    const newField = new NoteField({
      id: 'sameid',
      name: 'New field',
      mimeType: 'text/plain'
    })
    this.fields.unshiftNew(newField)
  }

  deleteField(id: string) {
    this.fields.delete(id)
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
