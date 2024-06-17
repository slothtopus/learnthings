import Dexie, { type EntityTable } from 'dexie'

import type { SerialisedDeck } from './Deck'
import type { SerialisedNote } from './Note'
import type { SerialisedCardMeta } from './Scheduler'

export interface DexiePersistableObject {
  id: number | string
  serialise: () => any
  persist: () => Promise<void>
}

const db = new Dexie('learnthings') as Dexie & {
  decks: EntityTable<SerialisedDeck, 'id'>
  notes: EntityTable<SerialisedNote, 'id'>
  cardMeta: EntityTable<SerialisedCardMeta, 'id'>
}

db.version(3).stores({
  decks: '++id',
  notes: '++id,deckId',
  cardMeta: 'id,deckId'
})

export { db }
