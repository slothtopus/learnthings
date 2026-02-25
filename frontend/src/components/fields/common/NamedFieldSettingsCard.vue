<script setup lang="ts">
import NamedNoteFieldEditForm from '@/components/fields/common/NamedFieldEditForm.vue'
import type { FormData as NamedNoteFieldFormData } from '@/components/fields/common/NamedFieldEditForm.vue'

import FieldContainer from '@/components/common/FieldContainer.vue'

import { useDynamicFormDialog } from '@/composables/useFormDialog'
import { useConfirmation } from '@/composables/useConfirmationDialog'
import { useProgress } from '@/composables/useProgress'

import { NoteField } from 'core/fields/NoteField.js'
import type { NoteType } from 'core/NoteType.js'

interface Props {
  noteType: NoteType
  field: NoteField<any>
  name: string;
}
const props = defineProps<Props>()

const { openDialog } = useDynamicFormDialog()
const handleEdit = async () => {
  const result = await openDialog<NamedNoteFieldFormData>(NamedNoteFieldEditForm, 'Edit field', {
    formData: {
      name: props.field.name,
    },
  })
  if (!result.cancelled) {
    const { name } = result.data
    props.field.setName(name)
    props.field.deck.persist()
  }
}

const { progressMonitor } = useProgress("Updating")
const { confirm } = useConfirmation()
const handleDelete = async () => {
  const confirmedDelete = await confirm('Are you sure?', `Delete field "${props.field.name}?"`)
  console.log('confirmedDelete = ', confirmedDelete)
  if (confirmedDelete) {
    props.field.delete()
    await props.field.deck.persist(progressMonitor)
  }
}
</script>

<template>
  <FieldContainer
    :subtitle="name"
    :title="field.name"
    :controls="['edit', 'delete']"
    @edit="handleEdit"
    @delete="handleDelete"
  />
</template>

<style scoped></style>
