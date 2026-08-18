<script setup lang="ts">
import AppDialog from '@/components/common/AppDialog.vue'
import AppButton from '@/components/common/AppButton.vue'

withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    cancelLabel?: string
    submitLabel?: string
    submitDisabled?: boolean
  }>(),
  {
    cancelLabel: 'Cancel',
    submitLabel: 'Create',
    submitDisabled: false,
  },
)

defineEmits<{
  close: []
  submit: []
}>()
</script>

<template>
  <AppDialog :title="title" :subtitle="subtitle" @close="$emit('close')">
    <slot />

    <template #footer>
      <AppButton variant="ghost" size="md" @click="$emit('close')">
        {{ cancelLabel }}
      </AppButton>
      <AppButton size="md" :disabled="submitDisabled" @click="$emit('submit')">
        {{ submitLabel }}
      </AppButton>
    </template>
  </AppDialog>
</template>
