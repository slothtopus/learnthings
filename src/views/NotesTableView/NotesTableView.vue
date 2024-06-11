<script setup lang="ts">
import { onMounted, ref } from 'vue'

import MasterLayout from '@/views/layouts/MasterLayout.vue'
import NotesTable from '@/components/NotesTable.vue'

import type { Deck } from '@/lib/Deck'
import type { Note } from '@/lib/Note'

import { useDecksStore } from '@/stores/decks'
const decksStore = useDecksStore()

interface Props {
  deckId: string
}
const props = defineProps<Props>()

const deck = ref<Deck | undefined>(undefined)
const notes = ref<Note[]>([])
onMounted(async () => {
  deck.value = await decksStore.getDeck(Number(props.deckId))
  if (deck.value !== undefined) {
    notes.value = await deck.value.getAllNotes()
  }
})
</script>

<template>
  <MasterLayout :loading="decksStore.loading">
    <template #title>{{
      deck == undefined ? 'Deck not found' : `All notes for: ${deck.name}`
    }}</template>
    <template #content v-if="deck === undefined">
      <p>Deck with id {{ deckId }}</p>
    </template>
    <template #content v-else><NotesTable :deck="deck" :notes="notes" /></template>
  </MasterLayout>
</template>

<style scoped></style>
