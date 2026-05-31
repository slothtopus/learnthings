<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue'
import { useFileDialog } from '@vueuse/core'

import NoteFieldWrapper from './NoteFieldWrapper.vue'
import AppButton from '@/components/used/AppButton.vue'

import type { Note } from 'core/Note.js'
import type { ImageAttachmentField } from 'core/fields/fields.js'

const props = defineProps<{
  field: ImageAttachmentField
  note: Note
}>()

const loading = ref(true)

onBeforeMount(async () => {
  try {
    const content = props.field.getContent(props.note)
    if (content) await content.getContent()
  } finally {
    loading.value = false
  }
})

const imageUrl = computed(() => {
  const content = props.field.getContent(props.note)
  if (content && !content.shouldDelete()) {
    const attachment = content.getAttachment()
    return attachment ? URL.createObjectURL(attachment.data) : undefined
  }
  return undefined
})

const { open, reset, onChange } = useFileDialog({ accept: 'image/*', multiple: false })

onChange((fileList) => {
  if (fileList && fileList.length > 0) {
    const file = fileList[0]
    props.field.getOrCreateContent(props.note).setContent({
      attachment: { filename: file.name, mimetype: file.type, data: file },
    })
    reset()
  }
})

const handleClear = async () => {
  props.field.getContent(props.note)?.flagShouldDelete(true)
  //await props.field.deck.persist()
}
</script>

<template>
  <NoteFieldWrapper :label="field.name">
    <!-- Loaded state -->
    <div
      class="h-64 relative group/img rounded-sm overflow-hidden border border-outline-variant/20 bg-surface-container-lowest flex items-center justify-center"
    >
      <!-- Image preview -->
      <img v-if="imageUrl" :src="imageUrl" class="w-full h-full object-contain" alt="Field image" />

      <!-- Empty state -->
      <div
        v-if="!loading && !imageUrl"
        class="absolute inset-0 flex flex-col items-center justify-center gap-3"
      >
        <span class="material-symbols-outlined text-3xl leading-none text-on-surface-variant"
          >add_photo_alternate</span
        >
        <AppButton size="sm" @click="open()">Upload image</AppButton>
      </div>

      <!-- Hover overlay (image exists) -->
      <div
        v-if="!loading && imageUrl"
        class="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover/img:opacity-100 bg-surface/60 backdrop-blur-sm transition-opacity"
      >
        <AppButton size="sm" @click="open()">Replace</AppButton>
        <AppButton size="sm" @click="handleClear" variant="secondary">Clear</AppButton>
      </div>
    </div>
  </NoteFieldWrapper>
</template>
