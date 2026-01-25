<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { InputText, Button, Select, Textarea } from 'primevue'

import { useFormDialogData } from '@/composables/useFormDialog'
import { useRouteMetaObjects } from '@/composables/useRouteObjects'
import { TextNoteField } from 'core/NoteField.js'
import { NoteType } from 'core/NoteType.js'
import { LOCALE_INSTRUCTIONS } from 'core/generators/OpenAI_tts.js'

const { getDeck } = useRouteMetaObjects()
const deck = getDeck()

export type FormData = { name: string; sourceFieldId?: string; prompt?: string }
const { formData, otherData, hasChanged } = useFormDialogData<FormData, { noteTypeId: string }>({
  name: '',
  sourceFieldId: undefined,
  prompt: undefined,
})
const textFields = computed(() => {
  const noteType = deck.objectManager.getObjectById(otherData.value?.noteTypeId)
  if (noteType instanceof NoteType) {
    return noteType.getAllFields().filter((f) => f instanceof TextNoteField)
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
    return sourceFieldOptions.value.find((s) => s.id === formData.value.sourceFieldId)
  },
  set: (opt: SelectOption) => {
    formData.value.sourceFieldId = opt.id
  },
})

const promptOptions: SelectOption[] = Object.keys(LOCALE_INSTRUCTIONS).map((i) => ({
  id: i,
  name: i,
}))
const selectedPrompt = ref<SelectOption | undefined>()
watch(selectedPrompt, (newPrompt) => {
  if (newPrompt) {
    console.log('setting formData.value.prompt')
    formData.value.prompt = LOCALE_INSTRUCTIONS[newPrompt.id as keyof typeof LOCALE_INSTRUCTIONS]
        console.log('new formData.value = ', formData.value)
  }
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
      <label for="new-field-name" class="font-thin block mb-2">Prompt</label>
      <Select v-model="selectedPrompt" :options="promptOptions" optionLabel="name" fluid placeholder="Select language"/>
      <Textarea class="mt-4" v-model="formData.prompt" inputId="prompt-input" rows="4" fluid />
    </div>
    <div class="flex gap-4 justify-end">
      <Button
        label="Update"
        :disabled="formData.name.length == 0 || formData.sourceFieldId === undefined || !hasChanged"
        size="small"
        @click="$emit('update', formData)"
      />
      <Button label="Cancel" size="small" severity="secondary" @click="$emit('cancel')" />
    </div>
  </div>
</template>

<style scoped></style>
