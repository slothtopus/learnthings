import { nanoid } from 'nanoid'
import type { ExcludeMethods } from './utils'
import type { PersistableObject } from './loader'

import type { Deck } from './Deck'

export type SerialisedNoteField = Omit<ExcludeMethods<NoteField>, 'mimeTypes' | '_parentDeck'>

export class NoteField implements PersistableObject {
  id: string
  name: string
  mimeType = 'text/plain'

  _parentDeck: Deck
  mimeTypes = ['text/plain']

  static createNewDefault(parentDeck: Deck, name?: string) {
    return new NoteField(parentDeck, {
      id: nanoid(6),
      name: name || 'New field',
      mimeType: 'text/plain'
    })
  }

  /*static createPlaceholder() {
    return new NoteField({
      id: '...',
      name: '...',
      mimeType: 'text/plain'
    })
  }*/

  constructor(parentDeck: Deck, { id, name, mimeType }: SerialisedNoteField) {
    this._parentDeck = parentDeck
    this.id = id
    this.name = name
    this.mimeType = mimeType
  }

  setName(name: string) {
    this.name = name
    this.persist()
  }

  setMimeType(mimeType: string) {
    if (this.mimeTypes.includes(mimeType)) {
      this.mimeType = mimeType
      this.persist()
    } else {
      throw new Error(`Unsupported mime type ${mimeType}`)
    }
  }

  serialise(): SerialisedNoteField {
    return {
      id: this.id,
      name: this.name,
      mimeType: this.mimeType
    }
  }

  async persist() {
    await this._parentDeck.persist()
  }
}
