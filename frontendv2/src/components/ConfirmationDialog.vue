<script setup lang="ts">
import FormDialog from '@/components/FormDialog.vue'
import { useDialogForm } from '@/composables/useFormDialog'

export type ConfirmationDialogContext =  { title: string; message: string }
const { submit, cancel, contextData } = useDialogForm<never, ConfirmationDialogContext>()
</script>

<template>
  <FormDialog
    :title="contextData.title"
    :show="true"
    @close="cancel"
    @submit="submit"
    cancel-label="No"
    submit-label="Yes"
  >
    <p class="text-sm font-light text-on-surface-variant leading-relaxed">
      {{ contextData.message }}
    </p>
  </FormDialog>
</template>

<style scoped></style>
