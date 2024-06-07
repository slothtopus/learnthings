<script setup lang="ts">
import { ref } from 'vue'

import MasterLayout from '@/views/layouts/MasterLayout.vue'

import NoteTypeContent from './NoteTypeContent.vue'

import { useDecksStore } from '@/stores/decks'
import { AsyncLoader } from '@/lib/loader'
import { NoteType } from '@/lib/NoteType'
const decksStore = useDecksStore()

interface Props {
  deckId: string
  noteTypeId: string
}
const props = defineProps<Props>()

//const noteType = decksStore.getNoteTypeById(props.deckId, props.noteTypeId)
const noteType = ref(new AsyncLoader<NoteType>(props.noteTypeId, NoteType))
</script>

<template>
  <MasterLayout>
    <template #title>{{
      noteType.data == undefined ? 'Note type not found' : `Note type: ${noteType.data.name}`
    }}</template>
    <template #content v-if="noteType.isError">
      <p>Note type with id {{ noteTypeId }} in deck {{ deckId }} not found</p>
    </template>
    <template #content v-else-if="noteType.data === undefined">
      <NoteTypeContent :noteType="NoteType.createPlaceholder()" />
    </template>
    <template #content v-else>
      <NoteTypeContent :noteType="noteType.data" />
    </template>
  </MasterLayout>
</template>

<style scoped></style>
