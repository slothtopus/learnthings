<script setup lang="ts">
import MasterLayout from '@/views/layouts/MasterLayout.vue'

import NoteTypeContent from './NoteTypeContent.vue'

import { useDecksStore } from '@/stores/decks'
const decksStore = useDecksStore()

interface Props {
  deckId: string
  noteTypeId: string
}
const props = defineProps<Props>()

const noteType = decksStore.getNoteTypeById(props.deckId, props.noteTypeId)
</script>

<template>
  <MasterLayout>
    <template #title>{{
      noteType == undefined ? 'Note type not found' : `Note type: ${noteType.name}`
    }}</template>
    <template #content v-if="noteType === undefined">
      <p>Note type with id {{ noteTypeId }} in deck {{ deckId }} not found</p>
    </template>
    <template #content v-else>
      <NoteTypeContent :noteType="noteType" />
    </template>
  </MasterLayout>
</template>

<style scoped></style>
