import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

import { Deck } from '@/lib/Deck'
import { NoteType } from '@/lib/NoteType'
import { CardTemplate } from '@/lib/CardTemplate'

export const useDecksStore = defineStore('decks', () => {
  const decks = ref<Deck[]>([])

  // ---------------- Object lookup ----------------
  const getDeckById = computed<(deckId: string) => Deck | undefined>(
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
  )

  // ---------------- Deck CRUD ----------------
  const createNewDeck = () => {
    decks.value.push(Deck.createNew())
  }

  const deleteDeck = (id: string) => {
    decks.value = decks.value.filter((d) => d.id != id)
  }

  return { decks, createNewDeck, deleteDeck, getDeckById, getNoteTypeById, getCardTemplateById }
})
