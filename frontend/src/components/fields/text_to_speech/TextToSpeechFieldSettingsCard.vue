<script setup lang="ts">
import { computed } from 'vue'

import { Button } from 'primevue'

import TextToSpeechNoteFieldEditForm from './TextToSpeechFieldEditForm.vue'
import type { FormData as TextToSpeechNoteFieldFormData } from './TextToSpeechFieldEditForm.vue'

import FieldContainer from '@/components/common/FieldContainer.vue'

import { useDynamicFormDialog } from '@/composables/useFormDialog'
import { useConfirmation } from '@/composables/useConfirmationDialog'

import { TextToSpeechField } from 'core/fields/v6/generated.js'
import type { NoteType } from 'core/NoteType.js'
import { useProgress } from '@/composables/useProgress'

interface Props {
  noteType: NoteType
  field: TextToSpeechField
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
        //sourceFieldId: props.field.options.sourceFieldId,
        options: props.field.options,
      },
      otherData: { noteTypeId: props.noteType.id },
    },
    // 'max-w-md' (string to trigger tailwind class generation)
    'md',
  )
  if (!result.cancelled) {
    const { name, options } = result.data
    props.field.setName(name)
    props.field.setOptions(options)
    await props.field.deck.persist()
  }
}

const { progressMonitor: deletionProgressMonitor } = useProgress('Deleting')
const { confirm } = useConfirmation()
const handleDelete = async () => {
  const confirmedDelete = await confirm('Are you sure?', `Delete field "${props.field.name}?"`)
  console.log('confirmedDelete = ', confirmedDelete)
  if (confirmedDelete) {
    props.field.delete()
    props.field.deck.persist(deletionProgressMonitor)
  }
}

const notesToGenerate = computed(() =>
  props.noteType.getAllNotes().filter((n) => props.field.shouldGenerate(n)),
)

const { progressMonitor: generationProgressMonitor } = useProgress('Generating audio')
const handleGenerateAll = async () => {
  generationProgressMonitor.total = notesToGenerate.value.length
  await Promise.all(
    notesToGenerate.value.map(async (n) => {
      try {
        await props.field.generate(n)
        await props.field.deck.persist()
        generationProgressMonitor.completed += 1
      } catch (err) {
        console.error(err)
      }
    }),
  )
  generationProgressMonitor.total = undefined
  generationProgressMonitor.completed = 0
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
