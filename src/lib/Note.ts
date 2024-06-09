import { NoteType } from './NoteType'
import { NoteField } from './NoteField'

import type { ExcludeMethods } from './utils'
import { db } from './dexieDB'
import type { DexiePersistableObject } from './dexieDB'

import { cloneDeep } from 'lodash-es'

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

const noteService = {
  addNew: async (note: Note) => {
    const serialisedNote = note.serialise()
    delete (serialisedNote as any)['id']
    serialisedNote.id = await db.notes.add(cloneDeep(serialisedNote))
    return new Note(serialisedNote)
  }
}

export type SerialisedNote = ExcludeMethods<Note>

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
      content: noteType.fields.map(
        (f) =>
          new NoteFieldContent({
            id: f.id,
            content: ''
          })
      )
    })
  }

  constructor({ id, deckId, noteTypeId, content }: SerialisedNote) {
    this.id = id
    this.deckId = deckId
    this.noteTypeId = noteTypeId
    this.content = content
  }

  zipFieldsAndContent(noteFields: NoteField[]) {
    const zipped = noteFields
      .map((f) => [f, this.content.find((c) => c.id == f.id)])
      .filter((z) => z[1] !== undefined) as [NoteField, NoteFieldContent][]
    return zipped
  }

  serialise(): SerialisedNote {
    return {
      id: this.id,
      deckId: this.deckId,
      noteTypeId: this.noteTypeId,
      content: this.content
    }
  }

  async persist() {
    throw new Error('persist not implemented')
  }
}
