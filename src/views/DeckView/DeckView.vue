<script setup lang="ts">
import { watch, computed } from 'vue'

import MasterLayout from '@/views/layouts/MasterLayout.vue'
import DeckViewContent from './DeckViewContent.vue'

import { useDecksStore } from '@/stores/decks'
const decksStore = useDecksStore()

interface Props {
  deckId: string
}
const props = defineProps<Props>()

const deck = computed(() => decksStore.getDeckById(props.deckId))

watch(
  deck,
  () => {
    console.log(`deck ${deck.value?.id} changed`)
  },
  { deep: true }
)
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
