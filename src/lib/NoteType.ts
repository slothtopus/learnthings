import { NoteField } from './NoteField'
import { CardTemplate } from './CardTemplate'
import { AsyncCollection, type PersistableObject } from './loader'

import { nanoid } from 'nanoid'

export type SerialisedNoteType = {
  id: string
  name: string
  field_ids: string[]
  cards: CardTemplate[]
}
export class NoteType implements PersistableObject {
  id: string
  name: string
  fields: AsyncCollection<NoteField>
  cards: CardTemplate[] = []

  static createPlaceholder() {
    return new NoteType({
      id: '...',
      name: '...',
      field_ids: [],
      cards: []
    })
  }

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
    /*newNoteType.fields = AsyncCollection.fromData([
      NoteField.createNewDefault('front'),
      NoteField.createNewDefault('back')
    ])*/
    newNoteType.fields.unshiftNew(NoteField.createNewDefault('back'))
    newNoteType.fields.unshiftNew(NoteField.createNewDefault('back'))

    console.log(newNoteType)
    return newNoteType
  }

  constructor({ id, name, field_ids, cards }: SerialisedNoteType) {
    this.id = id
    this.name = name
    this.fields = new AsyncCollection<NoteField>(field_ids, NoteField)
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

  serialise(): SerialisedNoteType {
    return {
      id: this.id,
      name: this.name,
      field_ids: this.fields.toIds(),
      cards: this.cards
    }
  }
}
