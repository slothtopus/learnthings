<script setup lang="ts">
import { computed } from 'vue'

import FormDialog from '@/components/used/FormDialog.vue'
import AppInput from '@/components/used/AppInput.vue'

import { useDialogForm } from '@/composables/useFormDialog'

export type NoteTypeDetailsFormData = {
  name: string
  description: string
}
export type NoteTypeDetailsDialogContext = { mode: 'new' | 'edit' }

const { formData, submit, cancel, contextData, hasChanged } = useDialogForm<
  NoteTypeDetailsFormData,
  NoteTypeDetailsDialogContext
>()

const canCreate = computed(() => formData.name.length > 0)
</script>

<template>
  <FormDialog
    :title="contextData.mode === 'new' ? 'New Note Type' : 'Edit Note Type'"
    :show="true"
    @close="cancel"
    @submit="submit"
    :submit-disabled="contextData.mode === 'new' ? !canCreate : !canCreate || !hasChanged"
    :submit-label="contextData.mode === 'new' ? 'Create' : 'Update'"
  >
    <div class="space-y-8">
      <AppInput
        v-model="formData.name"
        label="Note Type Name"
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
