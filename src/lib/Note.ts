import { NoteType } from './NoteType'

import type { ExcludeMethods } from './utils'

export class Note {
  noteType: NoteType
  content: any

  constructor({ noteType }: ExcludeMethods<Note>) {
    this.noteType = noteType
  }
}
