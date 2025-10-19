<script setup lang="ts">
import { computed } from 'vue'

import type { Note } from 'core/Note.js'
import type { TextNoteField } from 'core/NoteField.js'

import LabelledTextInput from '@/components/common/LabelledTextInput.vue'

interface Props {
  field: TextNoteField
  note: Note
}
const props = defineProps<Props>()

//const _fieldContent = reactive<TextNoteFieldContent | undefined>(undefined)

const fieldContent = computed({
  get: () => props.field.getContent(props.note)?.content,
  // we can call setObject on the content here?
  set: (val: string) => {
    //_fieldContent.objectManager.setObject(_fieldContent)
    const content = props.field.getOrCreateContent(props.note)
    content.setContent(val)
  },
})
</script>

<template>
  <LabelledTextInput v-model="fieldContent" :id="`edit-${field.name}`" :label="field.name" />
</template>

<style scoped></style>
