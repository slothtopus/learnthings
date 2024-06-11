<script setup lang="ts">
import { ref, watch, computed } from 'vue'

import NoteViewContent from './NoteViewContent.vue'
import { Button } from '@/components/shadcn-ui/button'

import { useToast } from '@/components/shadcn-ui/toast/use-toast'

import type { NoteType } from '@/lib/NoteType'
import { Note } from '@/lib/Note'
import { cloneDeep, isEqual } from 'lodash-es'

interface Props {
  noteTypes: NoteType[]
  noteType: NoteType
  note: Note
}
const props = defineProps<Props>()

const { toast } = useToast()
const handleSaveNote = async () => {
  try {
    await props.note.persist()
    toast({
      title: 'Note updated!',
      description: `Note with id ${props.note.id} updated successfully`
    })
  } catch (err) {
    console.error(err)
  }
}

const initialNoteState = ref(cloneDeep(props.note.serialise()))
watch(
  () => props.note.id,
  () => {
    initialNoteState.value = cloneDeep(props.note.serialise())
  }
)
const noteHasChanged = computed(() => !isEqual(props.note.serialise(), initialNoteState.value))
</script>

<template>
  <NoteViewContent
    title="Edit note"
    disableNoteTypeSelect
    :noteTypes="noteTypes"
    :noteType="noteType"
    :note="note"
  >
    <Button :disabled="!noteHasChanged" @click="handleSaveNote">Save</Button>
  </NoteViewContent>
</template>

<style scoped></style>
