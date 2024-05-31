<script setup lang="ts">
import { ref } from 'vue'

import MasterLayout from '@/views/layouts/MasterLayout.vue'
import NoteViewContent from './NoteViewContent.vue'

import { useDecksStore } from '@/stores/decks'
const decksStore = useDecksStore()

import { NoteType } from '@/lib/NoteType'

const noteType = ref(NoteType.createNewDefault())
/*interface Props {
  deckId: string
  noteTypeId: string
}
const props = defineProps<Props>()

const deck = computed(() => decksStore.getDeckById(props.deckId))*/
</script>

<template>
  <MasterLayout>
    <template #title>New note: note type name</template>
    <template #content v-if="false">
      <p>Not found</p>
    </template>
    <template #content v-else>
      <NoteViewContent :noteType="noteType" />
    </template>
  </MasterLayout>
</template>

<style scoped></style>
