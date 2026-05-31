<script setup lang="ts">
import { ref, watchEffect, onBeforeMount } from 'vue'
import { useFileDialog } from '@vueuse/core'

import NoteFieldWrapper from './NoteFieldWrapper.vue'
import AppIconButton from '@/components/used/AppIconButton.vue'

import type { Note } from 'core/Note.js'
import type { AudioAttachmentField } from 'core/fields/fields.js'

const props = defineProps<{
  field: AudioAttachmentField
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


// ── Playback URL ──────────────────────────────────────────────────────────────

const audioUrl = ref<string | undefined>(undefined)

watchEffect((onCleanup) => {
  const attachment = props.field.getContent(props.note)?.getAttachment()
  const blob = attachment?.data
  if (!blob) { audioUrl.value = undefined; return }
  const url = URL.createObjectURL(blob)
  audioUrl.value = url
  onCleanup(() => URL.revokeObjectURL(url))
})

// ── File upload ───────────────────────────────────────────────────────────────

const { open, reset, onChange } = useFileDialog({ accept: 'audio/*', multiple: false })

onChange((fileList) => {
  if (fileList && fileList.length > 0) {
    const file = fileList[0]
    setAttachment(file, file.name, file.type)
    reset()
  }
})

// ── Recording ─────────────────────────────────────────────────────────────────

type RecordState = 'idle' | 'recording' | 'error'
const recordState = ref<RecordState>('idle')
const recordingSeconds = ref(0)

let mediaRecorder: MediaRecorder | null = null
let chunks: Blob[] = []
let tickInterval: ReturnType<typeof setInterval> | null = null

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    chunks = []
    recordingSeconds.value = 0

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm'

    mediaRecorder = new MediaRecorder(stream, { mimeType })
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
    mediaRecorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop())
      const blob = new Blob(chunks, { type: mimeType })
      setAttachment(blob, 'recording.webm', mimeType)
      recordState.value = 'idle'
      if (tickInterval) { clearInterval(tickInterval); tickInterval = null }
    }

    mediaRecorder.start(100)
    recordState.value = 'recording'
    tickInterval = setInterval(() => { recordingSeconds.value++ }, 1000)
  } catch {
    recordState.value = 'error'
  }
}

function stopRecording() {
  mediaRecorder?.stop()
}

// ── Shared helper ─────────────────────────────────────────────────────────────

function setAttachment(data: Blob | File, filename: string, mimetype: string) {
  props.field.getOrCreateContent(props.note).setContent({ attachment: { filename, mimetype, data } })
}

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

const handleClear = async () => {
  props.field.getContent(props.note)?.flagShouldDelete(true)
}
</script>

<template>
  <NoteFieldWrapper :label="field.name">
    <div class="space-y-3">
      <!-- Player + actions row -->
      <div class="flex items-center gap-2">
        <!-- Recording bar -->
        <div
          v-if="recordState === 'recording'"
          class="flex-1 flex items-center gap-3 h-10 bg-surface-container-high border border-primary/20 rounded-xs px-4"
        >
          <span class="w-2 h-2 rounded-full bg-red-400 animate-pulse shrink-0" />
          <span class="text-xs font-mono text-on-surface flex-1">{{ formatTime(recordingSeconds) }}</span>
        </div>

        <!-- Audio player -->
        <audio
          v-else-if="audioUrl"
          :src="audioUrl"
          controls
          class="flex-1 h-10 rounded-xs min-w-0"
        />

        <!-- Empty placeholder -->
        <div
          v-else
          class="flex-1 h-10 rounded-xs bg-surface-container-lowest border border-outline-variant/20 flex items-center px-4 gap-2 text-on-surface/30"
        >
          <span class="material-symbols-outlined text-base leading-none">graphic_eq</span>
          <span class="text-xs font-light">No audio</span>
        </div>

        <!-- Icon buttons -->
        <AppIconButton
          v-if="recordState === 'recording'"
          icon="stop_circle"
          size="sm"
          @click="stopRecording"
        />
        <template v-else>
          <AppIconButton icon="mic" size="sm" :disabled="loading" @click="startRecording" />
          <AppIconButton icon="upload" size="sm" :disabled="loading" @click="open()" />
          <AppIconButton v-if="audioUrl" icon="close" variant="destructive" size="sm" @click="handleClear" />
        </template>
      </div>

      <!-- Error -->
      <p v-if="recordState === 'error'" class="text-[10px] text-red-400 font-light italic">
        Microphone access denied or unavailable.
      </p>
    </div>
  </NoteFieldWrapper>
</template>
