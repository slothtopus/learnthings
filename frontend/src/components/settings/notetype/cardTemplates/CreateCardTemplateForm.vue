<script setup lang="ts">
import { InputText, Button } from 'primevue'

import { useFormDialogData } from '@/composables/useFormDialog'
export type FormData = { name: string }
const { formData } = useFormDialogData<FormData>({ name: '' })

defineEmits<{
  update: [data: FormData]
  cancel: [value: void]
}>()
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <label for="new-template-name" class="font-thin block mb-2">Card template name</label>
      <InputText inputId="new-template-name" v-model="formData.name" fluid />
    </div>
    <div class="mt-6 flex gap-4 justify-end">
      <Button label="Create" size="small" @click="$emit('update', formData)" />
      <Button label="Cancel" size="small" severity="secondary" @click="$emit('cancel')" />
    </div>
  </div>
</template>

<style scoped></style>
