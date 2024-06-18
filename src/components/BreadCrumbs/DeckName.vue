<script setup lang="ts">
import { watch, ref } from 'vue'

import { useDecksStore } from '@/stores/decks'
import type { Deck } from '@/lib/Deck'

interface Props {
  deckId?: number
}
const props = defineProps<Props>()

const decksStore = useDecksStore()
const deck = ref<Deck | undefined>(undefined)
watch(
  () => props.deckId,
  async (newId) => {
    if (newId !== undefined) {
      deck.value = await decksStore.getDeck(newId)
    } else {
      deck.value = undefined
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex text-nowrap overflow-hidden">
    {{ 'Deck:'
    }}<span class="text-orange-200 text-ellipsis overflow-hidden ml-1">{{
      deck?.name || '...'
    }}</span>
  </div>
</template>

<style scoped></style>
