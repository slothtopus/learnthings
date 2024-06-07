<script setup lang="ts">
import { onMounted, ref } from 'vue'
import MasterLayout from '@/views/layouts/MasterLayout.vue'

import NoteTypeContent from './NoteTypeContent.vue'

import type { NoteType } from '@/lib/NoteType'

import { useDecksStore } from '@/stores/decks'
const decksStore = useDecksStore()

interface Props {
  deckId: string
  noteTypeIndex: string
}
const props = defineProps<Props>()

const noteType = ref<NoteType | undefined>(undefined)
onMounted(async () => {
  noteType.value = await decksStore.getNoteTypeByIndex(
    Number(props.deckId),
    Number(props.noteTypeIndex)
  )
})
</script>

<template>
  <MasterLayout :loading="decksStore.loading">
    <template #title>{{
      noteType == undefined ? 'Note type not found' : `Note type: ${noteType.name}`
    }}</template>
    <template #content v-if="noteType === undefined">
      <p>Note type with index {{ noteTypeIndex }} in deck {{ deckId }} not found</p>
    </template>
    <template #content v-else>
      <NoteTypeContent :noteType="noteType" />
    </template>
  </MasterLayout>
</template>

<style scoped></style>
