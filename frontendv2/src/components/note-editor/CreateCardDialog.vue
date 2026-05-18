<script setup lang="ts">
import { computed } from 'vue'

import FormDialog from '@/components/used/FormDialog.vue'
import AppInput from '@/components/used/AppInput.vue'

import { useDialogForm } from '@/composables/useFormDialog'

export type CreateCardTemplateFormData = {
  name: string
  description: string
}

const { formData, submit, cancel } = useDialogForm<
  CreateCardTemplateFormData
>()

const canCreate = computed(() => formData.name.length > 0)
</script>

<template>
  <FormDialog
    title="Create New Card"
    :show="true"
    @close="cancel"
    @submit="submit"
    :submit-disabled="!canCreate"
  >
    <div class="space-y-8">
      <AppInput
        v-model="formData.name"
        label="Card Template Name"
        placeholder="e.g. Molecular Biology Foundations"
      />
      <AppInput
        v-model="formData.description"
        label="Description"
        placeholder="Brief summary of the deck's focus..."
        multiline
      />
    </div>
  </FormDialog>
</template>

<style scoped></style>
