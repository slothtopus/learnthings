import { nanoid } from 'nanoid'
import type { PersistanceServiceInterface } from './loader'
import { getOne, persistOne } from './db'

const noteFieldService: PersistanceServiceInterface<NoteField> = {
  getOne: async (id: string) => {
    return new NoteField(await getOne<SerialisedNoteField>(id))
  },
  persistOne: (obj: NoteField) => persistOne(obj.serialise())
}

export type SerialisedNoteField = {
  id: string
  name: string
  mimeType: string
}

export class NoteField {
  id: string
  name: string
  mimeType = 'text/plain'
  mimeTypes = ['text/plain']

  static service = noteFieldService

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

  async persist() {
    NoteField.service.persistOne(this)
  }
}
