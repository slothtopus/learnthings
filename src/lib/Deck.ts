import { NoteType, type SerialisedNoteType } from './NoteType'
import { Note } from './Note'
import type { PersistableObject } from './loader'

import { nanoid } from 'nanoid'

import { persistOne } from './db'
import { debounce } from 'lodash-es'

export type SerialisedDeck = {
  id: string
  name: string
  noteTypes: SerialisedNoteType[]
  notes: Note[]
}

export class Deck implements PersistableObject {
  id: string
  name: string
  noteTypes: NoteType[]
  notes: Note[]

  static createNewDefault() {
    return new Deck({
      id: nanoid(6),
      name: 'New Deck',
      noteTypes: [],
      notes: []
    })
  }

  constructor({ id, name, noteTypes, notes }: SerialisedDeck) {
    this.id = id
    this.name = name
    this.noteTypes = noteTypes.map((n) => new NoteType(this, n))
    this.notes = notes
  }

  setName(name: string) {
    this.name = name
    this.persist()
  }

  async createNewNoteType() {
    this.noteTypes.unshift(await NoteType.createNewDefault(this))
    this.persist()
  }

  deleteNoteType(id: string) {
    this.noteTypes = this.noteTypes.filter((n) => n.id != id)
    this.persist()
  }

  setNoteTypes(noteTypes: NoteType[]) {
    this.noteTypes = noteTypes
    this.persist()
  }

  serialise(): SerialisedDeck {
    return {
      id: this.id,
      name: this.name,
      noteTypes: this.noteTypes.map((n) => n.serialise()),
      notes: this.notes
    }
  }

  async persist() {
    this.debouncedPersist(this)
  }
  debouncedPersist = debounce((deck: Deck) => {
    persistOne<Deck>(deck)
  }, 1000)
}
