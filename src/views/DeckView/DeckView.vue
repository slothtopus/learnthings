<script setup lang="ts">
import { watch, onMounted, ref } from 'vue'

import MasterLayout from '@/views/layouts/MasterLayout.vue'
import DeckViewContent from './DeckViewContent.vue'

import type { Deck } from '@/lib/Deck'

import { useDecksStore } from '@/stores/decks'
const decksStore = useDecksStore()

interface Props {
  deckId: string
}
const props = defineProps<Props>()

const deck = ref<Deck | undefined>(undefined)
onMounted(async () => {
  deck.value = await decksStore.getDeck(Number(props.deckId))
})
</script>

<template>
  <MasterLayout :loading="decksStore.loading">
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
