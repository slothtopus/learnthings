<script setup lang="ts">
import AppIconButton from '@/components/used/AppIconButton.vue'
import AppTooltip from '@/components/used/AppTooltip.vue'

interface Props {
  active: boolean
  icon: string
  actionIcon?: string
  dirty?: boolean
}
defineProps<Props>()

defineEmits<{ action: [] }>()
</script>

<template>
  <div
    class="flex items-center gap-2 rounded-xs ml-1 px-2 py-1.5 cursor-pointer transition-colors group"
    :class="
      active
        ? 'text-primary bg-primary/10'
        : 'text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container'
    "
  >
    <span class="material-symbols-outlined text-sm leading-none shrink-0">
      {{ icon }}
    </span>
    <AppTooltip v-if="dirty" text="Unsaved changes">
      <span class="flex items-center justify-center w-4 h-4 shrink-0">
        <span class="w-1.5 h-1.5 rounded-full bg-primary" />
      </span>
    </AppTooltip>
    <span class="text-xs font-light flex-1 truncate"><slot></slot></span>
    <div v-if="actionIcon" class="flex items-center" @click.stop>
      <AppIconButton
        :icon="actionIcon"
        size="xs"
        class="opacity-0 group-hover:opacity-100 transition-opacity"
        @click="$emit('action')"
      />
    </div>
  </div>
</template>

<style scoped></style>
