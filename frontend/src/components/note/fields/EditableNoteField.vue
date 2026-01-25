<script setup lang="ts">
import EditableTextField from './EditableTextField.vue'
import EditableImageField from './EditableImageField.vue'
import EditableTextToSpeechField from './EditableTextToSpeechField.vue'

import type { NoteField } from 'core/NoteField.js'
import { TextNoteField, AttachmentNoteField } from 'core/NoteField.js'
import { TextToSpeechNoteField } from 'core/fields/GeneratedNoteField.js'
import type { Note } from 'core/Note.js'

interface Props {
  field: NoteField<any>
  note: Note
}
defineProps<Props>()

const isTextField = (f: NoteField<any>): f is TextNoteField => f instanceof TextNoteField
const isAttachmentField = (f: NoteField<any>): f is AttachmentNoteField =>
  f instanceof AttachmentNoteField
const isTextToSpeechField = (f: NoteField<any>): f is TextToSpeechNoteField =>
  f instanceof TextToSpeechNoteField
</script>

<template>
  <EditableTextField v-if="isTextField(field)" :field="field" :note="note" />
  <EditableImageField v-else-if="isAttachmentField(field)" :field="field" :note="note" />
  <EditableTextToSpeechField v-else-if="isTextToSpeechField(field)" :field="field" :note="note" />
  <p v-else>Unknown field</p>
</template>

<style scoped></style>
