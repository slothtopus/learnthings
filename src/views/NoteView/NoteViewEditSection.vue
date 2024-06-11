<script setup lang="ts">
import { computed } from 'vue'

import { NoteType } from '@/lib/NoteType'
import { Note } from '@/lib/Note'

import NoteContent from './NoteContent.vue'

interface Props {
  noteType: NoteType
  note: Note
}
const props = defineProps<Props>()

const zipped = computed(() => props.note.zipFieldsAndContent(props.noteType.fields))
</script>

<template>
  <div class="-mr-4 -ml-2 py-6 pr-6 pl-2 overflow-auto flex flex-col gap-5">
    <NoteContent
      v-for="[field, content] in zipped"
      :key="field.id"
      :name="field.name"
      :noteContent="content"
    />
  </div>
</template>

<style scoped></style>
