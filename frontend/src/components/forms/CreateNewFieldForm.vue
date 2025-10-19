<script setup lang="ts">
import { computed } from 'vue'

import { InputText, Button, Select } from 'primevue'

//import type { FormData } from './CreateNewFieldForm.types'

import { useFormDialogData } from '@/composables/useFormDialog'
export type FormData = { name: string; fieldType: 'text' | 'image' }

const { formData } = useFormDialogData<FormData>({ name: '', fieldType: 'text' })

defineEmits<{
  update: [data: FormData]
  cancel: [value: void]
}>()

type FieldTypeOption = { name: string; id: FormData['fieldType'] }
const fields: FieldTypeOption[] = [
  { name: 'Text field', id: 'text' },
  { name: 'Image field', id: 'image' },
]

const selectedFieldType = computed({
  get: () => {
    return fields.find((f) => f.id == formData.value.fieldType)
  },
  set: (opt: FieldTypeOption) => {
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
      <Select v-model="selectedFieldType" :options="fields" optionLabel="name" fluid />
    </div>
    <div class="mt-6 flex gap-4 justify-end">
      <Button label="Create" size="small" @click="$emit('update', formData)" />
      <Button label="Cancel" size="small" severity="secondary" @click="$emit('cancel')" />
    </div>
  </div>
</template>

<style scoped></style>
