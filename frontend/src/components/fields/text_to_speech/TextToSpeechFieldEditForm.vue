<script setup lang="ts">
import { computed } from 'vue'
import { InputText, Button, Select } from 'primevue'

import { useFormDialogData } from '@/composables/useFormDialog'
import { useRouteMetaObjects } from '@/composables/useRouteObjects'
import { TextField } from 'core/fields/v6/fields.js'
import { NoteType } from 'core/NoteType.js'

import { VOICES, LANGUAGES } from 'core/generators/GoogleTextToSpeech.js'
import type { TextToSpeechOptions } from 'core/fields/v6/generated.js'

const { getDeck } = useRouteMetaObjects()
const deck = getDeck()

export type FormData = { name: string; options: TextToSpeechOptions }
const { formData, otherData, hasChanged } = useFormDialogData<FormData, { noteTypeId: string }>({
  name: '',
  options: { voiceName: 'Achernar', languageCode: 'en-GB' },
})
const textFields = computed(() => {
  const noteType = deck.objectManager.getObjectById(otherData.value?.noteTypeId)
  if (noteType instanceof NoteType) {
    return noteType.getAllFields().filter((f) => f instanceof TextField)
  } else {
    return []
  }
})

defineEmits<{
  update: [data: FormData]
  cancel: [value: void]
}>()

type SelectOption = { name: string; id: string }

const sourceFieldOptions = computed(() => {
  return textFields.value.map((f) => ({
    id: f.id,
    name: f.name,
  })) as SelectOption[]
})

const selectedSourceField = computed({
  get: () => {
    return sourceFieldOptions.value.find((s) => s.id === formData.value.options.sourceFieldId)
  },
  set: (opt: SelectOption) => {
    formData.value.options.sourceFieldId = opt.id
  },
})

const voiceOptions = VOICES.map((v) => ({ id: v, name: v }))
const selectedVoiceOption = computed({
  get: () => {
    return voiceOptions.find((v) => v.id === formData.value.options?.voiceName)
  },
  set: (opt: (typeof voiceOptions)[number]) => {
    formData.value.options['voiceName'] = opt.id
  },
})

const languageOptions = Object.entries(LANGUAGES).map(([k, v]) => ({
  id: k as keyof typeof LANGUAGES,
  name: v,
}))
const selectedLanguageOption = computed({
  get: () => {
    return languageOptions.find((v) => v.id === formData.value.options?.languageCode)
  },
  set: (opt: (typeof languageOptions)[number]) => {
    formData.value.options['languageCode'] = opt.id
  },
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <label for="new-field-name" class="font-thin block mb-2">Field name</label>
      <InputText v-model="formData.name" inputId="new-field-name" fluid />
    </div>
    <div>
      <label for="min-review-interval" class="font-thin block mb-2">Source field</label>
      <Select
        v-model="selectedSourceField"
        :options="sourceFieldOptions"
        optionLabel="name"
        fluid
      />
    </div>
    <div>
      <label for="new-field-name" class="font-thin block mb-2">Voice</label>
      <Select
        v-model="selectedVoiceOption"
        :options="voiceOptions"
        optionLabel="name"
        fluid
        placeholder="Select voice"
      />
    </div>
    <div>
      <label for="new-field-name" class="font-thin block mb-2">Language</label>
      <Select
        v-model="selectedLanguageOption"
        :options="languageOptions"
        optionLabel="name"
        fluid
        placeholder="Select voice"
      />
    </div>
    <div class="flex gap-4 justify-end">
      <Button
        label="Update"
        :disabled="formData.name.length == 0 || formData.options.sourceFieldId === undefined || !hasChanged"
        size="small"
        @click="$emit('update', formData)"
      />
      <Button label="Cancel" size="small" severity="secondary" @click="$emit('cancel')" />
    </div>
  </div>
</template>

<style scoped></style>
