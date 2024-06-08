<script setup lang="ts">
import { NoteType } from '@/lib/NoteType'
import { Note } from '@/lib/Note'

import NoteContent from './NoteContent.vue'

interface Props {
  noteType: NoteType
  note: Note
}
defineProps<Props>()
</script>

<template>
  <div class="flex flex-col gap-5">
    <NoteContent
      v-for="field in noteType.fields"
      :key="field.id"
      :name="field.name"
      :noteContent="note.content.find((c) => c.id == field.id)"
    />
  </div>
</template>

<style scoped></style>
