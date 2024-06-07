import { nanoid } from 'nanoid'
import type { PersistableObject } from './loader'

export type SerialisedNoteField = {
  id: string
  name: string
  mimeType: string
}

export class NoteField implements PersistableObject {
  id: string
  name: string
  mimeType = 'text/plain'
  mimeTypes = ['text/plain']

  static createNewDefault(name?: string) {
    return new NoteField({
      id: nanoid(6),
      name: name || 'New field',
      mimeType: 'text/plain'
    })
  }

  static createPlaceholder() {
    return new NoteField({
      id: '...',
      name: '...',
      mimeType: 'text/plain'
    })
  }

  constructor({ id, name, mimeType }: SerialisedNoteField) {
    this.id = id
    this.name = name
    this.mimeType = mimeType
  }

  setName(name: string) {
    this.name = name
  }

  setMimeType(mimeType: string) {
    if (this.mimeTypes.includes(mimeType)) {
      this.mimeType = mimeType
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
}
