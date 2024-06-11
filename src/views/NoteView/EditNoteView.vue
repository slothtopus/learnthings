<script setup lang="ts">
import { onMounted, ref } from 'vue'

import MasterLayout from '@/views/layouts/MasterLayout.vue'
import EditNoteContentWrapper from './EditNoteContentWrapper.vue'

import { useDecksStore } from '@/stores/decks'
const decksStore = useDecksStore()

import type { Deck } from '@/lib/Deck'
import type { NoteType } from '@/lib/NoteType'
import type { Note } from '@/lib/Note'

interface Props {
  deckId: string
  noteId: string
}
const props = defineProps<Props>()

const deck = ref<Deck | undefined>(undefined)
const noteType = ref<NoteType | undefined>(undefined)
const note = ref<Note | undefined>(undefined)
onMounted(async () => {
  deck.value = await decksStore.getDeck(Number(props.deckId))
  note.value = await deck.value.getNote(Number(props.noteId))
  noteType.value = deck.value.getNoteTypeById(note.value.noteTypeId)
})
</script>

<template>
  <MasterLayout :loading="decksStore.loading">
    <template #title>New note: note type name</template>
    <template #content v-if="deck === undefined || note === undefined || noteType === undefined">
      <p>Not found</p>
    </template>
    <template #content v-else>
      <EditNoteContentWrapper :noteTypes="deck.noteTypes" :noteType="noteType" :note="note" />
    </template>
  </MasterLayout>
</template>

<style scoped></style>
