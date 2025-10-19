<script setup lang="ts">
import { Card } from 'primevue'
import EditableNoteField from './fields/EditableNoteField.vue'
import { useNoteTypeDetails } from '@/composables/useObjectDetails'

import type { Note } from 'core/Note.js'

interface Props {
  note: Note
}
const props = defineProps<Props>()
const { fields } = useNoteTypeDetails(props.note.noteType)
</script>

<template>
  <Card class="border border-gray-500 w-full">
    <template #content>
      <div class="flex flex-col gap-6">
        <EditableNoteField v-for="f in fields" :key="f.id" :field="f" :note="note" />
      </div>
    </template>
  </Card>
</template>

<style scoped></style>
