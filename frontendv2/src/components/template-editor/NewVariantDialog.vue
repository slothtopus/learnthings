<script setup lang="ts">
import { computed } from 'vue'

import FormDialog from '@/components/used/FormDialog.vue'
import AppInput from '@/components/used/AppInput.vue'

import { useDialogForm } from '@/composables/useFormDialog'

export type NewVariantFormData = {
  name: string
  description: string
}

const { formData, submit, cancel } = useDialogForm<
  NewVariantFormData
>()

const canCreate = computed(() => formData.name.length > 0)
</script>

<template>
  <FormDialog
    title="Create New Variant"
    :show="true"
    @close="cancel"
    @submit="submit"
    :submit-disabled="!canCreate"
  >
    <div class="space-y-8">
      <AppInput
        v-model="formData.name"
        label="Card Template Variant Name"
        placeholder="..."
      />
    </div>
  </FormDialog>
</template>

<style scoped></style>
