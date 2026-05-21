<script setup lang="ts">
import FormDialog from '@/components/used/FormDialog.vue'
import { useDialogForm } from '@/composables/useFormDialog'
import type { TextInputSettings } from './TextInput.settings'

const { formData, hasChanged, submit, cancel } = useDialogForm<TextInputSettings>()

function toggle(key: keyof TextInputSettings) {
  formData[key] = !formData[key]
}
</script>

<template>
  <FormDialog
    title="Text Input Settings"
    submit-label="Save"
    :submit-disabled="!hasChanged"
    @close="cancel"
    @submit="submit"
  >
    <div class="flex flex-col gap-4">
      <label
        v-for="[key, label] in [
          ['ignorePunctuation', 'Ignore punctuation'],
          ['ignoreDiacritics', 'Ignore diacritics'],
        ] as const"
        :key="key"
        class="flex items-center justify-between gap-6 py-1 cursor-pointer select-none"
      >
        <span class="text-sm font-light text-on-surface">{{ label }}</span>
        <button
          type="button"
          role="switch"
          :aria-checked="formData[key]"
          class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors"
          :class="formData[key] ? 'bg-primary' : 'bg-surface-container-highest'"
          @click="toggle(key)"
        >
          <span
            class="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform"
            :class="formData[key] ? 'translate-x-[18px]' : 'translate-x-[3px]'"
          />
        </button>
      </label>
    </div>
  </FormDialog>
</template>
