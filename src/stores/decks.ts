import { ref } from 'vue'
import { defineStore } from 'pinia'

import { Deck } from '@/lib/Deck'

export const useDecksStore = defineStore('decks', () => {
  const decks = ref<Deck[]>([])
  const loading = ref(false)

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

  const getNoteTypeById = async (deckId: number, noteTypeId: number) => {
    const deck = await getDeck(deckId)
    const noteType = deck.noteTypes.find((n) => n.id == noteTypeId)
    if (noteType === undefined) {
      throw new Error(`Note type with id ${noteTypeId} not found`)
    } else {
      return noteType
    }
  }

  const getCardTemplateById = async (
    deckId: number,
    noteTypeId: number,
    cardTemplateId: number
  ) => {
    const noteType = await getNoteTypeById(deckId, noteTypeId)
    const cardTemplate = noteType.cards.find((c) => c.id == cardTemplateId)
    if (cardTemplate === undefined) {
      throw new Error(`Card template with id ${cardTemplateId} not found`)
    } else {
      return cardTemplate
    }
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
    getNoteTypeById,
    getCardTemplateById,
    deleteDeck
  }
})
