<script setup lang="ts">
import { ref, watch } from 'vue'

import NoteViewContent from './NoteViewContent.vue'
import { Button } from '@/components/shadcn-ui/button'

import { useToast } from '@/components/shadcn-ui/toast/use-toast'

import type { NoteType } from '@/lib/NoteType'
import { Note } from '@/lib/Note'

interface Props {
  noteTypes: NoteType[]
  noteType: NoteType
}
const props = defineProps<Props>()

const note = ref<Note>(Note.createNewEmpty(props.noteType))
watch(
  () => props.noteType,
  () => {
    note.value = Note.createNewEmpty(props.noteType)
  }
)

const { toast } = useToast()
const handleAddNote = async () => {
  note.value = await Note.service.addNew(note.value)
  toast({
    title: 'Note added!',
    description: `Note added with id ${note.value.id}`
  })
  note.value = Note.createNewEmpty(props.noteType)
}
</script>

<template>
  <NoteViewContent title="Add new note" :noteTypes="noteTypes" :noteType="noteType" :note="note">
    <Button @click="handleAddNote">Add</Button>
  </NoteViewContent>
</template>

<style scoped></style>
