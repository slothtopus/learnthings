import type { ExcludeMethods } from './utils'
import type { DexiePersistableObject } from './dexieDB'

import type { Deck } from './Deck'
import type { Note } from './Note'
import { NoteFieldContent } from './Note'

export type SerialisedNoteField = Omit<ExcludeMethods<NoteField>, 'mimeTypes' | '_parentDeck'>

export class NoteField implements DexiePersistableObject {
  id: number
  name: string
  mimeType = 'text/plain'

  _parentDeck: Deck
  mimeTypes = ['text/plain']

  static createNewDefault(parentDeck: Deck, name?: string) {
    return new NoteField(parentDeck, {
      id: parentDeck.getNextInternalId(),
      name: name || 'New field',
      mimeType: 'text/plain'
    })
  }

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

  getFieldId() {
    return this.name
  }

  async persist() {
    await this._parentDeck.persist()
  }

  getFieldContentFromNote(note: Note) {
    return note.content.find((c) => c.id == this.id)
  }

  getEmptyContent() {
    return new NoteFieldContent({ id: this.id, content: '' })
  }

  getPlaceholderContent() {
    return new NoteFieldContent({ id: this.id, content: this.name })
  }

  renderFromContent(content: NoteFieldContent) {
    if (content.id != this.id) {
      throw new Error(
        `Cannot render field id (${this.id}) and content id (${content.id}) mismatch `
      )
    }
    return { [this.getFieldId()]: content.content }
  }

  renderFromNote(note: Note) {
    const content = note.getContentForField(this)
    if (content === undefined) {
      throw new Error(`note content not found for field id ${this.id}`)
    }
    return this.renderFromContent(content)
  }

  /*render(content?: NoteFieldContent) {
    if (content === undefined) {
      return ''
    }
    if (content.id != this.id) {
      throw new Error(
        `Cannot render field id (${this.id}) and content id (${content.id}) mismatch `
      )
    }
    return content.content
  }*/
}
