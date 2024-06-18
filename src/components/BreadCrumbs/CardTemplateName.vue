<script setup lang="ts">
import { watch, ref } from 'vue'

import { useDecksStore } from '@/stores/decks'
import type { CardTemplate } from '@/lib/CardTemplate'

interface Props {
  deckId?: number
  noteTypeId?: number
  cardTemplateId?: number
}
const props = defineProps<Props>()

const decksStore = useDecksStore()
const template = ref<CardTemplate | undefined>(undefined)
watch(
  [() => props.deckId, () => props.noteTypeId, () => props.cardTemplateId],
  async ([newDeckId, newNoteTypeId, newCardTemplateId]) => {
    if (newDeckId !== undefined && newNoteTypeId !== undefined && newCardTemplateId !== undefined) {
      const deck = await decksStore.getDeck(newDeckId)
      const notetype = deck.getNoteTypeById(newNoteTypeId)
      template.value = notetype?.getCardTemplateById(newCardTemplateId)
    } else {
      template.value = undefined
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex text-nowrap overflow-hidden">
    {{ 'Template:'
    }}<span class="text-orange-200 text-ellipsis overflow-hidden ml-1">{{
      template?.name || '...'
    }}</span>
  </div>
</template>

<style scoped></style>
