<script setup lang="ts">
import { computed } from 'vue'

import FormDialog from '@/components/used/FormDialog.vue'
import AppInput from '@/components/used/AppInput.vue'

import { useDialogForm } from '@/composables/useFormDialog'

export type NewNamedObjectFormData = {
  name: string
}

export type NewNamedObjectContext = {
  title: string
  label: string
  placeholder: string
}

const { formData, submit, cancel, contextData } = useDialogForm<
  NewNamedObjectFormData, NewNamedObjectContext
>()

const canCreate = computed(() => formData.name.length > 0)
</script>

<template>
  <FormDialog
    :title="contextData.title"
    :show="true"
    @close="cancel"
    @submit="submit"
    :submit-disabled="!canCreate"
  >
    <div class="space-y-8">
      <AppInput
        v-model="formData.name"
        :label="contextData.label"
        :placeholder="contextData.placeholder"
      />
    </div>
  </FormDialog>
</template>

<style scoped></style>
