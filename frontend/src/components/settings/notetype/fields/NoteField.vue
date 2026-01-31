<script setup lang="ts">
import NamedNoteFieldEditForm from './NamedNoteFieldEditForm.vue'
import type { FormData as NamedNoteFieldFormData } from './NamedNoteFieldEditForm.vue'

import TextToSpeechNoteFieldEditForm from './TextToSpeechNoteFieldEditForm.vue'
import type { FormData as TextToSpeechNoteFieldFormData } from './TextToSpeechNoteFieldEditForm.vue'

import FieldContainer from '@/components/common/FieldContainer.vue'

import { useDynamicFormDialog } from '@/composables/useFormDialog'
import { useConfirmation } from '@/composables/useConfirmationDialog'
import { usePersistDeck } from '@/composables/useDecks'

import { TextNoteField, AttachmentNoteField } from 'core/NoteField.js'
import { TextToSpeechNoteField } from 'core/fields/GeneratedNoteField.js'
import type { NoteField } from 'core/NoteField.js'
import type { NoteType } from 'core/NoteType.js'

interface Props {
  noteType: NoteType
  field: NoteField<any>
}
const props = defineProps<Props>()

//const { openDialog } = useFormDialog<FormData>(NoteFieldEditForm, 'Edit field')
const { openDialog } = useDynamicFormDialog()
const handleEdit = async () => {
  if (props.field instanceof TextNoteField || props.field instanceof AttachmentNoteField) {
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
  } else if (props.field instanceof TextToSpeechNoteField) {
    const result = await openDialog<TextToSpeechNoteFieldFormData>(
      TextToSpeechNoteFieldEditForm,
      'Edit field',
      {
        formData: {
          name: props.field.name,
          sourceFieldId: props.field.sourceFieldId,
          options: props.field.options,
        },
        otherData: { noteTypeId: props.noteType.id },
      },
      // 'max-w-md' (string to trigger tailwind class generation)
      'md',
    )
    if (!result.cancelled) {
      const { name, sourceFieldId, options } = result.data
      props.field.setName(name)
      if (sourceFieldId) {
        props.field.setSource(sourceFieldId)
      }
      props.field.setOptions(options)
      await props.field.deck.persist()
    }
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
  } else if (field instanceof TextToSpeechNoteField) {
    return 'Text to speech field'
  } else {
    return 'Unknown'
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
