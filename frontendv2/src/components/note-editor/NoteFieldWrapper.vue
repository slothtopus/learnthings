<script setup lang="ts">
import AppIconButton from '@/components/used/AppIconButton.vue'

defineProps<{ label: string }>()
defineEmits<{ settings: [] }>()
</script>

<template>
  <div class="bg-surface-container-high border border-outline-variant/20 border-l-4 rounded-md flex gap-6 group hover:border-l-primary/40 hover:border-outline-variant/40 transition-all duration-300 py-4 px-6">
    <div class="flex items-start pt-1 shrink-0">
      <span class="material-symbols-outlined text-xl leading-none p-2 rounded-xs text-on-surface-variant hover:text-primary transition-all duration-200 cursor-grab active:cursor-grabbing">drag_indicator</span>
    </div>
    <div class="flex-grow min-w-0">
      <div class="flex justify-between items-center mb-3">
        <span class="text-xs font-bold tracking-widest uppercase text-on-surface-variant">{{ label }}</span>
        <AppIconButton icon="settings" size="sm" @click="$emit('settings')" />
      </div>
      <slot />
    </div>
  </div>
</template>
