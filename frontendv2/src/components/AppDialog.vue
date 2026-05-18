<script setup lang="ts">
import AppIconButton from '@/components/AppIconButton.vue'

defineProps<{
  title: string
  subtitle?: string
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <div
    class="relative w-full md:max-w-2xl md:rounded-md rounded-t-md shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] pointer-events-auto border border-primary/40 overflow-hidden"
    style="background: linear-gradient(145deg, #1e2022 0%, #16181a 100%)"
  >
      <!-- Drag handle (mobile only) -->
      <div class="flex justify-center pt-3 pb-1 md:hidden">
        <div class="w-10 h-1 rounded-full bg-on-surface/20" />
      </div>

      <!-- Header -->
      <div class="px-8 pt-6 pb-6 flex justify-between items-start">
        <div>
          <span
            v-if="subtitle"
            class="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2 block"
          >
            {{ subtitle }}
          </span>
          <h2 class="text-3xl tracking-tight text-on-surface font-extralight">{{ title }}</h2>
        </div>
        <AppIconButton icon="close" @click="$emit('close')" />
      </div>

      <!-- Body -->
      <div class="px-8 py-4 max-h-[60vh] md:max-h-none overflow-y-auto">
        <slot />
      </div>

      <!-- Footer -->
      <div class="px-8 py-6 mt-4 bg-surface-container-highest/60 flex items-center justify-end gap-6">
        <slot name="footer" />
      </div>
  </div>
</template>
