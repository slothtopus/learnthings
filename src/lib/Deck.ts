import { AsyncCollection } from './loader'
import { NoteType } from './NoteType'
import { Note } from './Note'

import { nanoid } from 'nanoid'

import type { ExcludeMethods } from './utils'

export class Deck {
  id: string
  name: string
  //noteTypes: NoteType[]
  noteTypes: AsyncCollection<NoteType>
  notes: Note[]

  static createNew() {
    return new Deck({
      id: nanoid(6),
      name: 'New Deck',
      noteTypes: new AsyncCollection<NoteType>([], NoteType),
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
    this.noteTypes.unshiftNew(NoteType.createNewDefault())
  }

  deleteNoteType(id: string) {
    this.noteTypes.delete(id)
  }

  /*deleteNoteType(id: string) {
    this.noteTypes = this.noteTypes.filter((n) => n.id != id)
  }

  setNoteTypes(noteTypes: NoteType[]) {
    this.noteTypes = noteTypes
  }*/

  serialise() {}
}
