<script setup lang="ts">
import { computed } from 'vue'

import { Button } from 'primevue'

import TextToSpeechNoteFieldEditForm from './TextToSpeechFieldEditForm.vue'
import type { FormData as TextToSpeechNoteFieldFormData } from './TextToSpeechFieldEditForm.vue'

import FieldContainer from '@/components/common/FieldContainer.vue'

import { useDynamicFormDialog } from '@/composables/useFormDialog'
import { useConfirmation } from '@/composables/useConfirmationDialog'
import { usePersistDeck } from '@/composables/useDecks'

import { TextToSpeechNoteField } from 'core/fields/GeneratedNoteField.js'
import type { NoteType } from 'core/NoteType.js'
import { useProgress } from '@/composables/useProgress'

interface Props {
  noteType: NoteType
  field: TextToSpeechNoteField
}
const props = defineProps<Props>()

const { openDialog } = useDynamicFormDialog()
const handleEdit = async () => {
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

const notesToGenerate = computed(() =>
  props.noteType.getAllNotes().filter((n) => props.field.shouldGenerate(n)),
)

const { progressMonitor } = useProgress('Generating audio')
const handleGenerateAll = async () => {
  progressMonitor.total = notesToGenerate.value.length
  await Promise.all(
    notesToGenerate.value.map(async (n) => {
      try {
        await props.field.generate(n)
        await props.field.deck.persist()
        progressMonitor.completed += 1
      } catch (err) {
        console.error(err)
      }
    }),
  )
  progressMonitor.total = undefined
  progressMonitor.completed = 0
}
</script>

<template>
  <FieldContainer
    subtitle="Text to speech field"
    :title="field.name"
    :controls="['edit', 'delete']"
    @edit="handleEdit"
    @delete="handleDelete"
  >
    <div class="flex items-center h-10">
      <span class="dark:text-gray-300 font-thin ml-2">Notes requiring generation:</span
      ><span class="ml-2">{{ notesToGenerate.length }}</span>
      <Button
        v-if="notesToGenerate.length > 0"
        class="ml-auto"
        size="small"
        outlined
        @click="handleGenerateAll"
        >Generate</Button
      >
    </div>
  </FieldContainer>
</template>

<style scoped></style>
