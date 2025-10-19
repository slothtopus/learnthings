<script setup lang="ts">
import NoteFieldEditForm from '../../../forms/NoteFieldEditForm.vue'
import type { FormData } from '../../../forms/NoteFieldEditForm.vue'
import FieldContainer from '@/components/common/FieldContainer.vue'

import { useFormDialog } from '@/composables/useFormDialog'
import { useConfirmation } from '@/composables/useConfirmationDialog'
import { usePersistDeck } from '@/composables/useDecks'

import { TextNoteField, AttachmentNoteField } from 'core/NoteField.js'
import type { NoteField } from 'core/NoteField.js'
import type { NoteType } from 'core/NoteType.js'

interface Props {
  noteType: NoteType
  field: NoteField<any>
}
const props = defineProps<Props>()

const { openDialog } = useFormDialog<FormData>(NoteFieldEditForm, 'Edit field')
const handleEdit = async () => {
  const result = await openDialog({ name: props.field.name })
  if (!result.cancelled) {
    const { name } = result.data
    props.field.setName(name)
    props.field.deck.persist()
  }
}

const { persistDeck } = usePersistDeck()
const { confirm } = useConfirmation()
const handleDelete = async () => {
  const confirmedDelete = await confirm('Are you sure?', `Delete field "${props.field.name}?"`)
  console.log('confirmedDelete = ', confirmedDelete)
  if (confirmedDelete) {
    props.field.delete()
    await persistDeck(props.field.deck)
  }
}

const fieldTypeDisplayName = (field: NoteField<any>) => {
  if (field instanceof TextNoteField) {
    return 'Text field'
  } else if (field instanceof AttachmentNoteField && field.mimetype.startsWith('image/')) {
    return 'Image field'
  } else {
    return 'Unknown field'
  }
}
</script>

<template>
  <FieldContainer
    :subtitle="fieldTypeDisplayName(field)"
    :title="field.name"
    :controls="['edit', 'delete']"
    @edit="handleEdit"
    @delete="handleDelete"
  />
</template>

<style scoped></style>
