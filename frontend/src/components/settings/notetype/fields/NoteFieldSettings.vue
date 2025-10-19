<script setup lang="ts">
import { useFormDialog } from '@/composables/useFormDialog'
import { Button } from 'primevue'

import NoteField from './NoteField.vue'
import CreateNewFieldForm from '../../../forms/CreateNewFieldForm.vue'
import type { FormData } from '../../../forms/CreateNewFieldForm.vue'
import type { NoteType } from 'core/NoteType.js'
import { AttachmentNoteField, TextNoteField } from 'core/NoteField.js'

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
    }
    props.noteType.deck.persist()
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 mt-4">
    <NoteField v-for="field in fields" :key="field.id" :field="field" :note-type="noteType" />
    <div class="flex w-full items-center">
      <Button text icon="pi pi-plus" label="New field" size="small" @click="handleCreateNew" />
    </div>
  </div>
</template>

<style scoped></style>
