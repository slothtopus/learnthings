<script setup lang="ts">
import AppButton from '@/components/AppButton.vue'
import AppIconButton from '@/components/used/AppIconButton.vue'

defineProps<{
  schedulerName: string
  showSettings?: boolean
}>()

defineEmits<{
  reviewNow: []
  change: []
  settings: []
}>()
</script>

<template>
  <div class="rounded-md overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] bg-surface-container-high border border-outline-variant/10">
    <!-- Header -->
    <div class="bg-surface-container-highest border-b border-outline-variant/20 px-4 py-3 flex items-center justify-between">
      <span class="text-xl font-extralight text-on-surface pl-2">{{ schedulerName }}</span>
      <div class="flex items-center gap-1">
        <AppIconButton icon="edit" size="sm" class="hover:bg-primary/10" @click="$emit('change')" />
        <AppIconButton v-if="showSettings !== false" icon="settings" size="sm" class="hover:bg-primary/10" @click="$emit('settings')" />
        <div class="w-px h-4 bg-white/10 mx-1" />
        <AppButton size="sm" @click="$emit('reviewNow')">Review Now</AppButton>
      </div>
    </div>

    <!-- Body -->
    <slot />
  </div>
</template>
