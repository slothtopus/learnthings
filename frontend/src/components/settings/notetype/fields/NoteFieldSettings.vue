<script setup lang="ts">
import { useFormDialog } from '@/composables/useFormDialog'
import { Button } from 'primevue'

import CreateNewFieldForm from './CreateNewFieldForm.vue'
import type { FormData } from './CreateNewFieldForm.vue'

import TextToSpeechFieldSettingsCard from '@/components/fields/text_to_speech/TextToSpeechFieldSettingsCard.vue'
import TextFieldSettingsCard from '@/components/fields/text/TextFieldSettingsCard.vue'
import ImageFieldSettingsCard from '@/components/fields/image/ImageFieldSettingsCard.vue'

import type { NoteType } from 'core/NoteType.js'
import { AttachmentNoteField, NoteField, TextNoteField } from 'core/NoteField.js'
import { TextToSpeechNoteField } from 'core/fields/GeneratedNoteField.js'

import { useNoteTypeDetails } from '@/composables/useObjectDetails'

interface Props {
  noteType: NoteType
}
const props = defineProps<Props>()

const { fields } = useNoteTypeDetails(() => props.noteType)

const { openDialog } = useFormDialog<FormData>(CreateNewFieldForm, 'Create new field')

const handleCreateNew = async () => {
  const result = await openDialog()
  if (!result.cancelled) {
    const { name, fieldType } = result.data
    switch (fieldType) {
      case 'text':
        props.noteType.createNewField(name, TextNoteField, {})
        break
      case 'image':
        props.noteType.createNewField(name, AttachmentNoteField, { mimetype: 'image/*' })
        break
      case 'text_to_speech':
        props.noteType.createNewField(name, TextToSpeechNoteField, {})
    }
    props.noteType.deck.persist()
  }
}

const isTextToSpeechField = (field: NoteField<any>): field is TextToSpeechNoteField =>
  field instanceof TextToSpeechNoteField

const isTextField = (field: NoteField<any>): field is TextNoteField =>
  field instanceof TextNoteField

const isImageField = (field: NoteField<any>): field is AttachmentNoteField =>
  field instanceof AttachmentNoteField && field.mimetype.startsWith('image/')
</script>

<template>
  <div class="flex flex-col gap-4 mt-4">
    <template v-for="field in fields" :key="field.id">
      <TextToSpeechFieldSettingsCard
        v-if="isTextToSpeechField(field)"
        :field="field"
        :note-type="noteType"
      />
      <ImageFieldSettingsCard
        v-else-if="isImageField(field)"
        :field="field"
        :note-type="noteType"
      />
      <TextFieldSettingsCard v-else-if="isTextField(field)" :field="field" :note-type="noteType" />
    </template>

    <div class="flex w-full items-center">
      <Button text icon="pi pi-plus" label="New field" size="small" @click="handleCreateNew" />
    </div>
  </div>
</template>

<style scoped></style>
