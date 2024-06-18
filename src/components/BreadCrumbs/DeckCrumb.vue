<script setup lang="ts">
import { ref, watch } from 'vue'
import MenuCrumb from './MenuCrumb.vue'

import { useDecksStore } from '@/stores/decks'

import type { Deck } from '@/lib/Deck'
import type { SelectOption } from '../ui/ui.types'

interface Props {
  deckId: number
}
const props = defineProps<Props>()

const decksStore = useDecksStore()
const deck = ref<Deck | undefined>(undefined)
watch(
  () => props.deckId,
  async () => {
    deck.value = await decksStore.getDeck(props.deckId)
  },
  { immediate: true }
)

const ACTIONS: SelectOption[] = [
  { id: 'settings', value: 'Settings' },
  { id: 'study', value: 'Study' },
  { id: 'browse', value: 'Browse notes' },
  { id: 'new', value: 'Add new note' }
]
</script>

<template>
  <MenuCrumb :options="ACTIONS" :name="deck?.name || ''">Deck</MenuCrumb>
</template>

<style scoped></style>
