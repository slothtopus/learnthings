<script setup lang="ts">
import { InputNumber, Button } from 'primevue'

export type FormData = {
  additionalNewCards: number
  maxAdditionalNewCards: number
}

import { useFormDialogData } from '@/composables/useFormDialog'
const { formData } = useFormDialogData<FormData>({
  additionalNewCards: 0,
  maxAdditionalNewCards: 0,
})

defineEmits<{
  update: [data: FormData]
  cancel: [value: void]
}>()
</script>

<template>
  <div>
    <InputNumber
      v-model="formData.additionalNewCards"
      inputId="add-new-cards"
      mode="decimal"
      showButtons
      :min="0"
      :max="formData.maxAdditionalNewCards"
      fluid
    />
  </div>
  <div class="mt-6 flex gap-4 justify-end">
    <Button
      label="Add"
      :disabled="formData.additionalNewCards == 0"
      size="small"
      @click="$emit('update', formData)"
    />
    <Button label="Cancel" size="small" severity="secondary" @click="$emit('cancel')" />
  </div>
</template>

<style scoped></style>
