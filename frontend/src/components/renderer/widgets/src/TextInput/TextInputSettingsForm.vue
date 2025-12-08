<script setup lang="ts">
import { Button, Checkbox } from 'primevue'

import { useFormDialogData } from '@/composables/useFormDialog'

import { DEFAULT_SETTINGS } from './TextInput.settings'
import type { TextInputSettings } from './TextInput.settings'
export type FormData = TextInputSettings

const { formData, hasChanged } = useFormDialogData<FormData>(DEFAULT_SETTINGS)

defineEmits<{
  update: [data: FormData]
  cancel: [value: void]
}>()
</script>

<template>
  <div class="grid grid-cols-[auto__auto] gap-4">
    <label class="font-thin block">Ignore punctuation</label>
    <Checkbox v-model="formData.ignorePunctuation" binary />
    <label class="font-thin block">Ignore diacritics</label>
    <Checkbox v-model="formData.ignoreDiacritics" binary />
  </div>
  <div class="mt-6 flex gap-4 justify-end">
    <Button
      label="Update"
      size="small"
      :disabled="!hasChanged"
      @click="$emit('update', formData)"
    />
    <Button label="Cancel" size="small" severity="secondary" @click="$emit('cancel')" />
  </div>
</template>

<style scoped></style>
