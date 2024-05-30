<script setup lang="ts">
import MasterLayout from '@/views/layouts/MasterLayout.vue'
import DeckViewContent from './DeckViewContent.vue'

import { useDecksStore } from '@/stores/decks'
const decksStore = useDecksStore()

interface Props {
  deckId: string
}
const props = defineProps<Props>()

const deck = decksStore.getDeckById(props.deckId)
</script>

<template>
  <MasterLayout>
    <template #title>{{ deck == undefined ? 'Deck not found' : `Deck: ${deck.name}` }}</template>
    <template #content v-if="deck === undefined">
      <p>Deck with id {{ deckId }} not found</p>
    </template>
    <template #content v-else>
      <DeckViewContent :deck="deck" />
    </template>
  </MasterLayout>
</template>

<style scoped></style>
