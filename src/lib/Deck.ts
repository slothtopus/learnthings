import { NoteType, type SerialisedNoteType } from './NoteType'
import { Note } from './Note'

import { debounce, cloneDeep } from 'lodash-es'

import { db } from './dexieDB'
import type { DexiePersistableObject } from './dexieDB'
import { Scheduler } from './Scheduler'

export type SerialisedDeck = {
  id: number
  name: string
  noteTypes: SerialisedNoteType[]
  notes: Note[]
  nextInternalId: number
}

export const deckService = {
  getAll: async (): Promise<Deck[]> => {
    return (await db.decks.toArray()).map((d) => new Deck(d))
  },
  getOne: async (id: number): Promise<Deck> => {
    const record = await db.decks.get(id)
    if (record === undefined) {
      throw new Error(`Deck with id ${id} not found`)
    }
    return new Deck(record)
  },
  createOne: async (deck: Deck): Promise<Deck> => {
    const serialisedDeck = deck.serialise()
    delete (serialisedDeck as any)['id']
    serialisedDeck.id = await db.decks.add(serialisedDeck)
    return new Deck(serialisedDeck)
  },
  persistOne: async (deck: Deck): Promise<void> => {
    await db.decks.put(cloneDeep(deck.serialise()))
  },
  deleteOne: async (id: number) => {
    await db.decks.delete(id)
  }
}

export class Deck implements DexiePersistableObject {
  id: number
  name: string
  noteTypes: NoteType[]
  notes: Note[]
  scheduler: Scheduler
  nextInternalId: number

  static service = deckService

  static createNewDefault() {
    return new Deck({
      id: 0,
      name: 'New Deck',
      noteTypes: [],
      notes: [],
      nextInternalId: 0
    })
  }

  constructor({ id, name, noteTypes, notes, nextInternalId }: SerialisedDeck) {
    this.id = id
    this.name = name
    this.noteTypes = noteTypes.map((n) => new NoteType(this, n))
    this.notes = notes
    this.nextInternalId = nextInternalId
    this.scheduler = new Scheduler(this, { newCards: 5 })
  }

  setName(name: string) {
    this.name = name
    this.persist()
  }

  async createNewNoteType() {
    this.noteTypes.unshift(await NoteType.createNewDefault(this))
    this.persist()
  }

  deleteNoteType(id: number) {
    this.noteTypes = this.noteTypes.filter((n) => n.id != id)
    this.persist()
  }

  setNoteTypes(noteTypes: NoteType[]) {
    this.noteTypes = noteTypes
    this.persist()
  }

  getNoteTypeById(id: number) {
    return this.noteTypes.find((n) => n.id == id)
  }

  getNoteTypeByIdOrThrow(id: number) {
    const noteType = this.getNoteTypeById(id)
    if (noteType === undefined) {
      throw new Error(`note type ${id} not found`)
    }
    return noteType
  }

  serialise(): SerialisedDeck {
    return {
      id: this.id,
      name: this.name,
      noteTypes: this.noteTypes.map((n) => n.serialise()),
      notes: this.notes,
      nextInternalId: this.nextInternalId
    }
  }

  getNextInternalId() {
    return this.nextInternalId++
  }

  async persist() {
    this.debouncedPersist(this)
  }
  debouncedPersist = debounce((deck: Deck) => {
    Deck.service.persistOne(deck)
  }, 1000)

  getAllNotes() {
    return Note.service.getNotesForDeck(this.id)
  }

  getNote(id: number) {
    return Note.service.getNote(id)
  }

  deleteNote(noteId: number) {
    return Note.service.deleteNote(noteId)
  }

  async getStatistics() {
    const notes = await Note.service.getNotesForDeck(this.id)
    return {
      notes: notes.length,
      cards: notes.reduce((cardCount, note) => {
        const noteType = this.getNoteTypeById(note.noteTypeId)
        return cardCount + (noteType?.cards.length || 0)
      }, 0)
    }
  }
}
