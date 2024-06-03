<script setup lang="ts">
import { computed } from 'vue'

import MasterLayout from '@/views/layouts/MasterLayout.vue'
import NewNoteViewContent from './NewNoteViewContent.vue'

import { useDecksStore } from '@/stores/decks'
const decksStore = useDecksStore()

//const noteType = ref(NoteType.createNewDefault())
interface Props {
  deckId: string
  noteTypeId: string
}
const props = defineProps<Props>()

const deck = computed(() => decksStore.getDeckById(props.deckId))
const noteType = computed(() => decksStore.getNoteTypeById(props.deckId, props.noteTypeId))
</script>

<template>
  <MasterLayout>
    <template #title>New note: note type name</template>
    <template #content v-if="deck === undefined || noteType === undefined">
      <p>Not found</p>
    </template>
    <template #content v-else>
      <NewNoteViewContent :noteTypes="deck.noteTypes" :noteType="noteType" />
    </template>
  </MasterLayout>
</template>

<style scoped></style>
