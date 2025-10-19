<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'

import { Button } from 'primevue'
import LabelledFormContainer from '@/components/common/LabelledFormContainer.vue'

import type { Note } from 'core/Note.js'
import { AttachmentNoteField } from 'core/NoteField.js'

import { useFileDialog } from '@vueuse/core'
import type { AttachmentData } from 'core/utils/attachments.js'

interface Props {
  field: AttachmentNoteField
  note: Note
}
const props = defineProps<Props>()

const fetched = ref(false)
onMounted(async () => {
  await props.field.getContent(props.note)?.fetchAttachment()
  fetched.value = true
})

const fieldContent = computed({
  get: () => {
    if (!fetched.value) {
      return undefined
    }
    const attachment = props.field.getContent(props.note)?.getAttachment()
    if (attachment) {
      return URL.createObjectURL(attachment.data)
    } else {
      return undefined
    }
  },
  set: (attachment: AttachmentData) => {
    const content = props.field.getOrCreateContent(props.note)
    content.setContent(attachment)
  },
})

const { open, reset, onChange } = useFileDialog({
  accept: 'image/*',
  multiple: false,
})

onChange(async (fileList) => {
  if (fileList && fileList.length > 0) {
    const file = fileList[0]
    fieldContent.value = {
      filename: file.name,
      mimetype: file.type,
      data: file,
    }
    console.log('EditableImageField: set the field content')
    reset()
  }
})
</script>

<template>
  <LabelledFormContainer :id="`edit-${field.name}`" :label="field.name">
    <div
      class="container border border-dashed pointer rounded-md h-64 w-full flex items-center justify-center bg-contain bg-no-repeat bg-center relative"
      :style="`background-image: url(${fieldContent})`"
    >
      <div
        class="flex flex-col gap-4 options"
        :class="{ 'opacity-0 transition-opacity': fieldContent !== undefined }"
      >
        <Button icon="pi pi-plus" label="From URL" size="small" outlined />
        <Button icon="pi pi-plus" label="From file" size="small" outlined @click="() => open()" />
      </div>
    </div>
  </LabelledFormContainer>
</template>

<style scoped>
.container:hover > .options {
  opacity: 1;
}
</style>
