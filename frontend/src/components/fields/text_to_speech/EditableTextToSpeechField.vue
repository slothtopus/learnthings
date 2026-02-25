<script setup lang="ts">
import { ref, watchEffect, onMounted } from 'vue'

import { Button } from 'primevue'
import LabelledFormContainer from '@/components/common/LabelledFormContainer.vue'
import type { TextToSpeechField } from 'core/fields/generated.js'
import type { Note } from 'core/Note.js'

interface Props {
  field: TextToSpeechField
  note: Note
}
const props = defineProps<Props>()

const fetched = ref(false)
onMounted(async () => {
  await props.field.getContent(props.note)?.getContent()
  fetched.value = true
})


const fieldContent = ref<string | undefined>(undefined)

watchEffect(async (onCleanup) => {
  if (!fetched.value) {
    fieldContent.value = undefined
    return
  }

  const attachment = props.field.getContent(props.note)?.getAttachment()
  const blob = attachment?.data

  if (!blob) {
    fieldContent.value = undefined
    return
  }

  let cancelled = false
  onCleanup(() => {
    cancelled = true
  })

  const dataUrl = await blobToDataUrl(blob)

  if (!cancelled) {
    fieldContent.value = dataUrl
  }
})

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error("FileReader failed"))
    reader.readAsDataURL(blob)
  })
}
</script>

<template>
  <LabelledFormContainer :id="`edit-${field.name}`" :label="field.name">
    <div class="flex gap-4">
      <audio
        :class="
          fieldContent === undefined || field.isGenerating ? 'opacity-75 pointer-events-none' : ''
        "
        :disabled="!fieldContent"
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
