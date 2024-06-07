import { ref } from 'vue'
import { defineStore } from 'pinia'

import { Deck } from '@/lib/Deck'
import { createOne, getOne } from '@/lib/db'

export const useDecksStore = defineStore('decks', () => {
  const decks = ref<Deck[]>([])

  // ---------------- Object lookup ----------------
  /*const getDeckById = computed<(deckId: string) => Deck | undefined>(
    () => (deckId: string) => decks.value.find((d) => d.id == deckId)
  )
  const getNoteTypeById = computed<(deckId: string, noteTypeId: string) => NoteType | undefined>(
    () => (deckId: string, noteTypeId: string) =>
      getDeckById.value(deckId)?.noteTypes.find((n) => n.id == noteTypeId)
  )
  const getCardTemplateById = computed<
    (deckId: string, noteTypeId: string, cardTemplateId: string) => CardTemplate | undefined
  >(
    () => (deckId: string, noteTypeId: string, cardTemplateId: string) =>
      getNoteTypeById.value(deckId, noteTypeId)?.cards.find((c) => c.id == cardTemplateId)
  )*/

  // ---------------- Deck CRUD ----------------
  const createNewDeck = async () => {
    const newDeck = await createOne(Deck.createNewDefault())
    decks.value.unshift(newDeck)
  }

  const getDeck = async (deckId: string) => {
    const cachedDeck = decks.value.find((d) => d.id == deckId)
    if (cachedDeck !== undefined) {
      return cachedDeck
    } else {
      const persistedDeck = new Deck(await getOne<Deck>(deckId))
      decks.value.push(persistedDeck)
      return persistedDeck
    }
  }

  const getNoteTypeByIndex = async (deckId: string, noteTypeIndex: number) => {
    const deck = await getDeck(deckId)
    return deck.noteTypes[noteTypeIndex]
  }

  const getCardTemplateByIndex = async (
    deckId: string,
    noteTypeIndex: number,
    cardTemplateIndex: number
  ) => {
    const noteType = await getNoteTypeByIndex(deckId, noteTypeIndex)
    return noteType.cards[cardTemplateIndex]
  }

  const deleteDeck = (id: string) => {
    decks.value = decks.value.filter((d) => d.id != id)
  }

  return {
    decks,
    createNewDeck,
    getDeck,
    getNoteTypeByIndex,
    getCardTemplateByIndex,
    deleteDeck
    /*getDeckById,
    getNoteTypeById,
    getCardTemplateById*/
  }
})
