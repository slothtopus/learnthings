<script setup lang="ts">
import { computed } from 'vue'

import { InputText, Button, Select } from 'primevue'

import { useFormDialogData } from '@/composables/useFormDialog'

const fields = [
  { name: 'Text field', id: 'text' },
  { name: 'Image field', id: 'image' },
  { name: 'Text to Speech field', id: 'text_to_speech' },
] as const
// purely to avoid a type error on options prop
const mutableFields = [...fields]

export type FormData = { name: string; fieldType: (typeof fields)[number]['id'] }

const { formData } = useFormDialogData<FormData>({ name: '', fieldType: 'text' })

defineEmits<{
  update: [data: FormData]
  cancel: [value: void]
}>()

const selectedFieldType = computed({
  get: () => {
    return fields.find((f) => f.id == formData.value.fieldType)
  },
  set: (opt: (typeof fields)[number]) => {
    formData.value.fieldType = opt.id
  },
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <label for="new-field-name" class="font-thin block mb-2">Field name</label>
      <InputText inputId="new-field-name" v-model="formData.name" fluid />
    </div>
    <div>
      <label for="min-review-interval" class="font-thin block mb-2">Field type</label>
      <Select v-model="selectedFieldType" :options="mutableFields" optionLabel="name" fluid />
    </div>
    <div class="mt-6 flex gap-4 justify-end">
      <Button
        label="Create"
        size="small"
        :disabled="formData.name.length === 0"
        @click="$emit('update', formData)"
      />
      <Button label="Cancel" size="small" severity="secondary" @click="$emit('cancel')" />
    </div>
  </div>
</template>

<style scoped></style>
