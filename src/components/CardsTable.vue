<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Note } from '@/lib/Note'
import type { Deck } from '@/lib/Deck'
import type { RenderedCard } from '@/lib/CardTemplate'

import PaginationControl from '@/components/ui/PaginationControl.vue'

import { useCardDimensions } from '@/composables/useCardDimensions'

import CardRow from './CardRow.vue'

interface Props {
  notes: Note[]
  deck: Deck
}
const props = defineProps<Props>()

const cards = computed(() => {
  return props.notes.flatMap<{ front: RenderedCard; back: RenderedCard }>((n) => {
    const noteType = props.deck.getNoteTypeById(n.noteTypeId)
    if (noteType === undefined) {
      return []
    } else {
      return noteType.generateCards(n)
    }
  })
})

const cardPageIndex = ref(0)
const cardsPerPage = ref(10)
const paginatedCards = computed(() => {
  return cards.value.slice(cardPageIndex.value, cardPageIndex.value + cardsPerPage.value)
})

const { selectedDimensionOption } = useCardDimensions()
</script>

<template>
  <div class="overflow-auto">
    <CardRow
      v-for="(card, i) in paginatedCards"
      :key="i"
      :renderedFront="card.front"
      :renderedBack="card.back"
      :dims="selectedDimensionOption.dims"
    />
  </div>
  <div class="mt-auto p-4 flex justify-between items-center gap-3">
    <span class="text-sm text-slate-500"
      >Showing cards {{ cardPageIndex * cardsPerPage + 1 }} to
      {{ Math.min(cards.length, (cardPageIndex + 1) * cardsPerPage) }} of {{ cards.length }}</span
    >
    <PaginationControl
      :totalItems="cards.length"
      :itemsPerPage="cardsPerPage"
      :page="cardPageIndex + 1"
      @update:page="cardPageIndex = $event - 1"
    />
  </div>
</template>

<style scoped></style>
