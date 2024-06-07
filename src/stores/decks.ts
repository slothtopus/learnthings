import { ref } from 'vue'
import { defineStore } from 'pinia'

import { Deck } from '@/lib/Deck'

export const useDecksStore = defineStore('decks', () => {
  const decks = ref<Deck[]>([])
  const loading = ref(false)

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
    const newDeck = await Deck.service.createOne(Deck.createNewDefault())
    decks.value.unshift(newDeck)
  }

  const refreshDecks = async () => {
    loading.value = true
    decks.value = await Deck.service.getAll()
    loading.value = false
  }

  const getDeck = async (deckId: number) => {
    const cachedDeck = decks.value.find((d) => d.id == deckId)
    if (cachedDeck !== undefined) {
      return cachedDeck
    } else {
      loading.value = true
      const persistedDeck = await Deck.service.getOne(deckId)
      decks.value.push(persistedDeck)
      loading.value = false
      return persistedDeck
    }
  }

  const getNoteTypeByIndex = async (deckId: number, noteTypeIndex: number) => {
    const deck = await getDeck(deckId)
    return deck.noteTypes[noteTypeIndex]
  }

  const getCardTemplateByIndex = async (
    deckId: number,
    noteTypeIndex: number,
    cardTemplateIndex: number
  ) => {
    const noteType = await getNoteTypeByIndex(deckId, noteTypeIndex)
    return noteType.cards[cardTemplateIndex]
  }

  const deleteDeck = (id: number) => {
    decks.value = decks.value.filter((d) => d.id != id)
    Deck.service.deleteOne(id)
  }

  return {
    decks,
    loading,
    createNewDeck,
    getDeck,
    refreshDecks,
    getNoteTypeByIndex,
    getCardTemplateByIndex,
    deleteDeck
    /*getDeckById,
    getNoteTypeById,
    getCardTemplateById*/
  }
})
