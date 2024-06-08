<script setup lang="ts">
import { computed } from 'vue'

import LabelledControl from '@/components/ui/LabelledControl.vue'
import { Textarea } from '@/components/shadcn-ui/textarea'
import { Label } from '@/components/shadcn-ui/label'

import { NoteContent } from '@/lib/Note'

interface Props {
  name: string
  noteContent: NoteContent
}
const props = defineProps<Props>()

const content = computed({
  get: () => props.noteContent.content,
  set: (content: string) => props.noteContent.setContent(content)
})
</script>

<template>
  <LabelledControl>
    <Label :for="`field-${name}-${noteContent.id}`">{{ name }}</Label>
    <Textarea :id="`field-${name}-${noteContent.id}`" v-model="content" />
  </LabelledControl>
</template>

<style scoped></style>
