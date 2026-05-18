<script setup lang="ts">
import { provide, watch } from 'vue'
import {
  _pendingDialog,
  _formData,
  _loadFormData,
  _resolveDialog,
  _makeHasChanged,
  DIALOG_FORM_KEY,
} from '@/composables/useFormDialog'

watch(_pendingDialog, (dialog) => {
  if (dialog) _loadFormData(dialog)
})

watch(_pendingDialog, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})

const hasChanged = _makeHasChanged()

const submit = () => _resolveDialog({ cancelled: false, data: { ..._formData } })
const cancel = () => _resolveDialog({ cancelled: true })

provide(DIALOG_FORM_KEY, {
  formData: _formData,
  get contextData() {
    return _pendingDialog.value?.contextData
  },
  hasChanged,
  submit,
  cancel,
})
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex md:items-center md:justify-center md:p-4 items-end"
      :class="{ 'pointer-events-none': !_pendingDialog }"
    >
      <!-- Backdrop -->
      <Transition
        enter-from-class="opacity-0"
        enter-active-class="transition-opacity duration-300"
        leave-active-class="transition-opacity duration-200"
        leave-to-class="opacity-0"
      >
        <div
          v-if="_pendingDialog"
          class="absolute inset-0 bg-surface-container-lowest/50 backdrop-blur-sm pointer-events-auto"
          @click="cancel"
        />
      </Transition>

      <!-- Panel: transition classes are applied to the root element of the rendered component -->
      <Transition
        enter-from-class="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
        enter-active-class="transition-all duration-300 ease-out"
        leave-active-class="transition-all duration-200 ease-in"
        leave-to-class="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
      >
        <component v-if="_pendingDialog" :is="_pendingDialog.component" />
      </Transition>
    </div>
  </Teleport>
</template>
