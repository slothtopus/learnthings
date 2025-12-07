<script setup lang="ts">
import { Button, Checkbox } from 'primevue'

import { useFormDialogData } from '@/composables/useFormDialog'

import {DEFAULT_SETTINGS} from './RevealButton.settings'
import type { RevealButtonSettings } from './RevealButton.settings'
export type FormData = RevealButtonSettings

const { formData, hasChanged } = useFormDialogData<FormData>(DEFAULT_SETTINGS)

defineEmits<{
  update: [data: FormData]
  cancel: [value: void]
}>()
</script>

<template>
  <div>
    <div class="flex gap-4 items-center">
      <label for="min-session-cards" class="font-thin block">Unstyled</label>
      <Checkbox v-model="formData.unstyled" binary />
    </div>
  </div>
    <div class="mt-6 flex gap-4 justify-end">
      <Button label="Update" size="small" :disabled="!hasChanged" @click="$emit('update', formData)" />
      <Button label="Cancel" size="small" severity="secondary" @click="$emit('cancel')" />
    </div>
</template>

<style scoped></style>
