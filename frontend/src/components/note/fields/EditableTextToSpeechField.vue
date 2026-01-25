<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

import { Button } from 'primevue'
import LabelledFormContainer from '@/components/common/LabelledFormContainer.vue'
import type { TextToSpeechNoteField } from 'core/fields/GeneratedNoteField.js'
import type { Note } from 'core/Note.js'

interface Props {
  field: TextToSpeechNoteField
  note: Note
}
const props = defineProps<Props>()

const fetched = ref(false)
onMounted(async () => {
  await props.field.getContent(props.note)?.fetchAttachment()
  fetched.value = true
})

const fieldContent = computed(() => {
  if (!fetched.value) {
    return undefined
  }
  const attachment = props.field.getContent(props.note)?.getAttachment()
  if (attachment) {
    return URL.createObjectURL(attachment.data)
  } else {
    return undefined
  }
})
</script>

<template>
  <LabelledFormContainer :id="`edit-${field.name}`" :label="field.name">
    <div class="flex gap-4">
      <audio
        :class="
          fieldContent === undefined || field.isGenerating ? 'opacity-75 pointer-events-none' : ''
        "
        :disabled="!fieldContent || true"
        controls
        :src="fieldContent"
      ></audio>
      <Button
        v-if="fetched && (fieldContent === undefined || field.shouldGenerate(note))"
        :disabled="!field.canGenerate(note) || field.isGenerating"
        :loading="field.isGenerating"
        outlined
        text
        icon="pi pi-sync"
        @click="field.generate(note)"
      />
    </div>
  </LabelledFormContainer>
</template>

<style scoped></style>
