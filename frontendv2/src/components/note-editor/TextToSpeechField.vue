<script setup lang="ts">
import { ref, watchEffect } from 'vue'

import NoteFieldWrapper from './NoteFieldWrapper.vue'
import AppButton from '@/components/used/AppButton.vue'
import TextToSpeechSettingsForm from './TextToSpeechSettingsForm.vue'
import type { TextToSpeechSettingsFormData } from './TextToSpeechSettingsForm.vue'

import { useFormDialog } from '@/composables/useFormDialog'

import type { Note } from 'core/Note.js'
import type { NoteType } from 'core/NoteType.js'
import type { TextToSpeechField as TTextToSpeechField } from 'core/fields/generated.js'

const props = defineProps<{
  field: TTextToSpeechField
  note: Note
  noteType: NoteType
}>()

const audioUrl = ref<string | undefined>(undefined)

watchEffect((onCleanup) => {
  const attachment = props.field.getContent(props.note)?.getAttachment()
  const blob = attachment?.data
  if (!blob) {
    audioUrl.value = undefined
    return
  }
  const url = URL.createObjectURL(blob)
  audioUrl.value = url
  onCleanup(() => URL.revokeObjectURL(url))
})

const settingsDialog = useFormDialog<TextToSpeechSettingsFormData, { noteType: NoteType }>(
  TextToSpeechSettingsForm,
)

const handleSettings = async () => {
  const result = await settingsDialog.open(
    { ...props.field.options },
    { noteType: props.noteType },
  )
  if (result.cancelled) return
  props.field.setOptions(result.data)
  await props.field.deck.persist()
}
</script>

<template>
  <NoteFieldWrapper :label="field.name" @settings="handleSettings">
    <div class="space-y-3">
      <!-- Audio player -->
      <div class="flex items-center gap-3">
        <audio
          v-if="audioUrl"
          :src="audioUrl"
          controls
          :class="field.isGenerating ? 'opacity-40 pointer-events-none' : ''"
          class="flex-1 h-10 rounded-xs"
        />
        <div
          v-else
          class="flex-1 h-10 rounded-xs bg-surface-container-lowest border border-outline-variant/20 flex items-center px-4 gap-2 text-on-surface/30"
        >
          <span class="material-symbols-outlined text-base leading-none">auto_awesome</span>
          <span class="text-xs font-light">No audio generated</span>
        </div>

        <!-- Generate button: show if no audio or needs regeneration -->
        <AppButton
          v-if="!audioUrl || field.shouldGenerate(note)"
          size="sm"
          :disabled="!field.canGenerate(note) || field.isGenerating"
          @click="field.generate(note)"
        >
          <span
            class="material-symbols-outlined text-sm leading-none"
            :class="field.isGenerating && 'animate-spin'"
          >sync</span>
          {{ field.isGenerating ? 'Generating…' : 'Generate' }}
        </AppButton>
      </div>

      <!-- Status line -->
      <p
        v-if="!field.canGenerate(note)"
        class="text-[10px] font-light text-on-surface-variant/50 italic"
      >
        Configure a source field in settings to enable generation.
      </p>
      <p
        v-else-if="field.shouldGenerate(note) && audioUrl"
        class="text-[10px] font-light text-primary/60 italic"
      >
        Source text has changed — regenerate to update.
      </p>
    </div>
  </NoteFieldWrapper>
</template>
