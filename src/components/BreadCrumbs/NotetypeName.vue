<script setup lang="ts">
import { watch, ref } from 'vue'

import { useDecksStore } from '@/stores/decks'
import type { NoteType } from '@/lib/NoteType'

interface Props {
  deckId?: number
  noteTypeId?: number
}
const props = defineProps<Props>()

const decksStore = useDecksStore()
const notetype = ref<NoteType | undefined>(undefined)
watch(
  [() => props.deckId, () => props.noteTypeId],
  async ([newDeckId, newNoteTypeId]) => {
    if (newDeckId !== undefined && newNoteTypeId !== undefined) {
      const deck = await decksStore.getDeck(newDeckId)
      notetype.value = deck.getNoteTypeById(newNoteTypeId)
    } else {
      notetype.value = undefined
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex text-nowrap overflow-hidden">
    {{ 'Notetype:'
    }}<span class="text-orange-200 text-ellipsis overflow-hidden ml-1">{{
      notetype?.name || '...'
    }}</span>
  </div>
</template>

<style scoped></style>
