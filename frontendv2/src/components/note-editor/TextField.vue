<script setup lang="ts">
import { computed } from 'vue'

import NoteFieldWrapper from './NoteFieldWrapper.vue';
import AppInput from '@/components/used/AppInput.vue'

import type { Note } from 'core/Note.js'
import type { TextField } from 'core/fields/fields.js'

interface Props {
  field: TextField
  note: Note
}
const props = defineProps<Props>()

//const _fieldContent = reactive<TextNoteFieldContent | undefined>(undefined)

const fieldContent = computed({
  get: () => props.field.getContent(props.note)?.getContent(),
  // we can call setObject on the content here?
  set: (val: string) => {
    //_fieldContent.objectManager.setObject(_fieldContent)
    const content = props.field.getOrCreateContent(props.note)
    content.setContent(val)
  },
})
</script>

<template>
<NoteFieldWrapper :label="field.name">
    <AppInput v-model="fieldContent" :placeholder="'Description goes here...'" />
</NoteFieldWrapper>
</template>



<style scoped>

</style>