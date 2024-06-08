<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import MasterLayout from '@/views/layouts/MasterLayout.vue'
import NoteViewContent from './NoteViewContent.vue'

import { useDecksStore } from '@/stores/decks'
const decksStore = useDecksStore()

import type { Deck } from '@/lib/Deck'
import type { NoteType } from '@/lib/NoteType'

interface Props {
  deckId: string
  noteTypeId: string
}
const props = defineProps<Props>()

const deck = ref<Deck | undefined>(undefined)
const noteType = ref<NoteType | undefined>(undefined)
onMounted(async () => {
  deck.value = await decksStore.getDeck(Number(props.deckId))
  noteType.value = deck.value.noteTypes.find((n) => n.id == Number(props.noteTypeId))
})
watch(
  () => props.noteTypeId,
  () => {
    noteType.value = deck.value?.noteTypes.find((n) => n.id == Number(props.noteTypeId))
  }
)
</script>

<template>
  <MasterLayout :loading="decksStore.loading">
    <template #title>New note: note type name</template>
    <template #content v-if="deck === undefined || noteType === undefined">
      <p>Not found</p>
    </template>
    <template #content v-else>
      <NoteViewContent :noteTypes="deck.noteTypes" :noteType="noteType" />
    </template>
  </MasterLayout>
</template>

<style scoped></style>
