import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { Deck } from '@/lib/Deck'

export const useDecksStore = defineStore('decks', () => {
  const decks = ref<Deck[]>([])

  const getDeckById = computed(() => (deckId: string) => decks.value.find((d) => d.id == deckId))

  const createNewDeck = () => {
    decks.value.push(Deck.createNew())
  }

  const deleteDeck = (deck: Deck) => {
    decks.value = decks.value.filter((d) => d.id != deck.id)
  }

  return { decks, createNewDeck, deleteDeck, getDeckById }
})
