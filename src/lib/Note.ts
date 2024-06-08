import { NoteType } from './NoteType'
import type { DexiePersistableObject } from './dexieDB'

import type { ExcludeMethods } from './utils'

export class NoteFieldContent {
  id: number
  content: string

  constructor({ id, content }: ExcludeMethods<NoteFieldContent>) {
    this.id = id
    this.content = content
  }

  setContent(content: string) {
    this.content = content
  }
}

export class Note {
  id: number
  noteTypeId: number
  content: NoteFieldContent[]

  static createNewEmpty(noteType: NoteType) {
    return new Note({
      id: 0,
      noteTypeId: noteType.id,
      content: noteType.fields.map(
        (f) =>
          new NoteFieldContent({
            id: f.id,
            content: ''
          })
      )
    })
  }

  constructor({ id, noteTypeId, content }: ExcludeMethods<Note>) {
    this.id = id
    this.noteTypeId = noteTypeId
    this.content = content
  }
}
