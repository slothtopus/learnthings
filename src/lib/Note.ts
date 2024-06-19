import { NoteType } from './NoteType'
import { NoteField } from './NoteField'

import type { ExcludeMethods } from './utils'
import { db } from './dexieDB'
import type { DexiePersistableObject } from './dexieDB'

import { cloneDeep } from 'lodash-es'

export type SerialisedNoteFieldContent = ExcludeMethods<NoteFieldContent>
export class NoteFieldContent {
  id: number
  content: string

  constructor({ id, content }: SerialisedNoteFieldContent) {
    this.id = id
    this.content = content
  }

  setContent(content: string) {
    this.content = content
  }

  serialise(): SerialisedNoteFieldContent {
    return {
      id: this.id,
      content: this.content
    }
  }
}

const noteService = {
  addNew: async (note: Note) => {
    const serialisedNote = note.serialise()
    delete (serialisedNote as any)['id']
    serialisedNote.id = await db.notes.add(cloneDeep(serialisedNote))
    return new Note(serialisedNote)
  },
  getNotesForDeck: async (deckId: number) => {
    const serialisedNotes = await db.notes.where({ deckId }).toArray()
    return serialisedNotes.map((n) => new Note(n))
  },
  deleteNote: async (noteId: number) => {
    await db.notes.delete(noteId)
  },
  getNote: async (noteId: number) => {
    const serialisedNote = await db.notes.get(noteId)
    if (serialisedNote === undefined) {
      throw new Error(`Note with ${noteId} not found`)
    }
    return new Note(serialisedNote)
  },
  persistNote: async (note: Note) => {
    await db.notes.put(cloneDeep(note.serialise()))
  }
}

export type SerialisedNote = {
  id: number
  deckId: number
  noteTypeId: number
  content: SerialisedNoteFieldContent[]
}

export class Note implements DexiePersistableObject {
  id: number
  deckId: number
  noteTypeId: number
  content: NoteFieldContent[]

  static service = noteService

  static createNewEmpty(noteType: NoteType) {
    return new Note({
      id: -1,
      deckId: noteType._parentDeck.id,
      noteTypeId: noteType.id,
      content: noteType.fields.map((f) => f.getEmptyContent())
    })
  }

  static createPlaceholderNote(noteType: NoteType) {
    return new Note({
      id: -1,
      deckId: noteType._parentDeck.id,
      noteTypeId: noteType.id,
      content: noteType.fields.map((f) => f.getPlaceholderContent())
    })
  }

  constructor({ id, deckId, noteTypeId, content }: SerialisedNote) {
    this.id = id
    this.deckId = deckId
    this.noteTypeId = noteTypeId
    this.content = content.map((c) => new NoteFieldContent(c))
  }

  getContentForField(field: NoteField) {
    return this.content.find((c) => c.id == field.id)
  }

  zipFieldsAndContent(noteFields: NoteField[]) {
    const zipped = noteFields
      .map((f) => [f, this.content.find((c) => c.id == f.id)])
      .filter((z) => z[1] !== undefined) as [NoteField, NoteFieldContent][]
    return zipped
  }

  /*populateFields(noteFields: NoteField[], usePlaceholderContent = false) {
    return noteFields.reduce(
      (allFields, field) => {
        const content =
          this.getContentForField(field) ||
          (usePlaceholderContent ? field.getPlaceholderContent() : undefined)
        allFields[field.getFieldId()] = field.render(content)
        return allFields
      },
      {} as Record<string, string>
    )
  }*/

  serialise(): SerialisedNote {
    return {
      id: this.id,
      deckId: this.deckId,
      noteTypeId: this.noteTypeId,
      content: this.content.map((c) => c.serialise())
    }
  }

  async persist() {
    Note.service.persistNote(this)
  }
}
