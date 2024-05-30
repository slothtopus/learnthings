import { NoteType } from './NoteType'
import { Note } from './Note'

import type { ExcludeMethods } from './utils'

export class Deck {
  id: string
  name: string
  noteTypes: NoteType[]
  notes: Note[]

  static createNew() {
    return new Deck({
      id: String(Date.now()),
      name: 'New Deck',
      noteTypes: [],
      notes: []
    })
  }

  constructor({ id, name, noteTypes, notes }: ExcludeMethods<Deck>) {
    this.id = id
    this.name = name
    this.noteTypes = noteTypes
    this.notes = notes
  }

  setName(name: string) {
    this.name = name
  }

  createNewNoteType() {
    this.noteTypes.push(NoteType.createNewDefault())
  }
}
