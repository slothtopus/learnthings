<script setup lang="ts">
import { InputText, Button } from 'primevue'

import { useFormDialogData } from '@/composables/useFormDialog'

export type FormData = { name: string; label: string }
const { formData, hasChanged } = useFormDialogData<FormData>({ name: '', label: 'Name' })

defineEmits<{
  update: [data: FormData]
  cancel: [value: void]
}>()
</script>

<template>
  <div>
    <label for="new-field-name" class="font-thin block mb-2">{{ formData.label }}</label>
    <InputText v-model="formData.name" inputId="new-field-name" fluid />
  </div>
  <div class="mt-6 flex gap-4 justify-end">
    <Button
      label="Update"
      :disabled="formData.name.length == 0 || !hasChanged"
      size="small"
      @click="$emit('update', formData)"
    />
    <Button label="Cancel" size="small" severity="secondary" @click="$emit('cancel')" />
  </div>
</template>

<style scoped></style>
