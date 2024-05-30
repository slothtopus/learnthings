import { nanoid } from 'nanoid'
import type { ExcludeMethods } from './utils'

export class NoteField {
  id: string
  name: string
  mimeType = 'text/plain'
  mimeTypes = ['text/plain']

  static createNew(name?: string) {
    return new NoteField({
      id: nanoid(6),
      name: name || 'New field',
      mimeType: 'text/plain'
    })
  }

  constructor({ id, name, mimeType }: Omit<ExcludeMethods<NoteField>, 'mimeTypes'>) {
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
}
