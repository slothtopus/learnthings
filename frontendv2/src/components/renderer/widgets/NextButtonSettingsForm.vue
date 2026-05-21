<script setup lang="ts">
import FormDialog from '@/components/used/FormDialog.vue'
import { useDialogForm } from '@/composables/useFormDialog'
import type { NextButtonSettings } from './NextButton.settings'

const { formData, hasChanged, submit, cancel } = useDialogForm<NextButtonSettings>()
</script>

<template>
  <FormDialog
    title="Next Button Settings"
    submit-label="Save"
    :submit-disabled="!hasChanged"
    @close="cancel"
    @submit="submit"
  >
    <label class="flex items-center justify-between gap-6 py-1 cursor-pointer select-none">
      <span class="text-sm font-light text-on-surface">Unstyled</span>
      <button
        type="button"
        role="switch"
        :aria-checked="formData.unstyled"
        class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors"
        :class="formData.unstyled ? 'bg-primary' : 'bg-surface-container-highest'"
        @click="formData.unstyled = !formData.unstyled"
      >
        <span
          class="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform"
          :class="formData.unstyled ? 'translate-x-[18px]' : 'translate-x-[3px]'"
        />
      </button>
    </label>
  </FormDialog>
</template>
