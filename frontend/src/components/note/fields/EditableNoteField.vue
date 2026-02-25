<script setup lang="ts">
import EditableTextField from '@/components/fields/text/EditableTextField.vue'
import EditableImageField from '@/components/fields/image/EditableImageField.vue'
import EditableTextToSpeechField from '@/components/fields/text_to_speech/EditableTextToSpeechField.vue'

import type { AnyNoteField } from 'core/fields/v6/base.js'
import { TextField, ImageAttachmentField } from 'core/fields/v6/fields.js'
import { TextToSpeechField } from 'core/fields/v6/generated.js'
import type { Note } from 'core/Note.js'

interface Props {
  field: AnyNoteField
  note: Note
}
defineProps<Props>()

const isTextField = (f: AnyNoteField): f is TextField => f instanceof TextField
const isAttachmentField = (f: AnyNoteField): f is ImageAttachmentField =>
  f instanceof ImageAttachmentField
const isTextToSpeechField = (f: AnyNoteField): f is TextToSpeechField =>
  f instanceof TextToSpeechField
</script>

<template>
  <EditableTextField v-if="isTextField(field)" :field="field" :note="note" />
  <EditableImageField v-else-if="isAttachmentField(field)" :field="field" :note="note" />
  <EditableTextToSpeechField v-else-if="isTextToSpeechField(field)" :field="field" :note="note" />
  <p v-else>Unknown field</p>
</template>

<style scoped></style>
