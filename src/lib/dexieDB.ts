import Dexie, { type EntityTable } from 'dexie'
import type { SerialisedDeck } from './Deck'

export interface DexiePersistableObject {
  id: number
  serialise: () => any
  persist: () => Promise<void>
}

const db = new Dexie('learnthings') as Dexie & {
  decks: EntityTable<SerialisedDeck, 'id'>
}

db.version(1).stores({
  decks: '++id'
})

export { db }
