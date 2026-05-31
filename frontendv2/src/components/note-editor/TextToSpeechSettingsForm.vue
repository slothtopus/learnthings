<script setup lang="ts">
import { computed } from 'vue'

import FormDialog from '@/components/used/FormDialog.vue'
import SelectDropdown from '@/components/SelectDropdown.vue'
import type { SelectOption } from '@/components/SelectDropdown.vue'
import { useDialogForm } from '@/composables/useFormDialog'

import { TextField } from 'core/fields/fields.js'
import type { NoteType } from 'core/NoteType.js'
import type { TextToSpeechOptions } from 'core/fields/generated.js'
import { VOICES, LANGUAGES } from 'core/generators/GoogleTextToSpeech.js'

export type TextToSpeechSettingsFormData = TextToSpeechOptions
type TContext = { noteType: NoteType }

const { formData, contextData, hasChanged, submit, cancel } =
  useDialogForm<TextToSpeechSettingsFormData, TContext>()

const textFieldOptions = computed<SelectOption[]>(() =>
  (contextData?.noteType.getAllFields() ?? [])
    .filter((f) => f instanceof TextField)
    .map((f) => ({ value: f.id, label: f.name })),
)

const voiceOptions: SelectOption[] = VOICES.map((v) => ({ value: v, label: v }))

const languageOptions: SelectOption[] = Object.entries(LANGUAGES).map(([k, v]) => ({
  value: k,
  label: v,
}))
</script>

<template>
  <FormDialog
    title="Text-to-Speech Settings"
    submit-label="Apply"
    :submit-disabled="!hasChanged || !formData.sourceFieldId"
    @close="cancel"
    @submit="submit"
  >
    <div class="space-y-5">
      <SelectDropdown
        label="Source Field"
        :model-value="formData.sourceFieldId ?? ''"
        :options="textFieldOptions"
        placeholder="Select a text field"
        @update:model-value="formData.sourceFieldId = $event"
      />
      <SelectDropdown
        label="Voice"
        :model-value="formData.voiceName ?? ''"
        :options="voiceOptions"
        placeholder="Select voice"
        @update:model-value="formData.voiceName = $event as typeof formData.voiceName"
      />
      <SelectDropdown
        label="Language"
        :model-value="formData.languageCode"
        :options="languageOptions"
        placeholder="Select language"
        @update:model-value="formData.languageCode = $event as typeof formData.languageCode"
      />
    </div>
  </FormDialog>
</template>
