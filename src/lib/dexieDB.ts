import Dexie, { type EntityTable } from 'dexie'

import type { SerialisedDeck } from './Deck'
import type { SerialisedNote } from './Note'

export interface DexiePersistableObject {
  id: number
  serialise: () => any
  persist: () => Promise<void>
}

const db = new Dexie('learnthings') as Dexie & {
  decks: EntityTable<SerialisedDeck, 'id'>
  notes: EntityTable<SerialisedNote, 'id'>
}

db.version(2).stores({
  decks: '++id',
  notes: '++id,deckId'
})

export { db }
