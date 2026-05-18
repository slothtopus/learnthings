<script setup lang="ts">
import AppButton from '@/components/AppButton.vue'

defineProps<{
  schedulerName: string
  cardsDue: number
  newCards: number
  knownCards: number
}>()

defineEmits<{
  reviewNow: []
  changeScheduler: []
}>()
</script>

<template>
  <div class="rounded-md overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] bg-surface-container-high border border-outline-variant/10">
    <!-- Scheduler selector -->
    <button
      class="w-full bg-surface-container-highest border-b border-outline-variant/20 hover:bg-surface-bright transition-colors px-6 py-4 flex items-center justify-between group"
      @click="$emit('changeScheduler')"
    >
      <span class="text-xl font-extralight text-on-surface group-hover:text-primary transition-colors">{{ schedulerName }}</span>
      <span class="material-symbols-outlined text-primary/60 group-hover:text-primary transition-colors">expand_more</span>
    </button>

    <!-- Stats + action -->
    <div class="px-6 py-6">
      <div class="flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="flex items-center gap-12">
          <div class="space-y-0.5">
            <div class="flex items-baseline gap-2">
              <span class="text-4xl font-thin text-on-surface">{{ cardsDue }}</span>
              <span class="text-[9px] font-medium uppercase tracking-[0.2em] text-on-surface/50">Cards Due</span>
            </div>
          </div>
          <div class="flex gap-8 border-l border-outline-variant/20 pl-8">
            <div class="flex flex-col">
              <span class="text-2xl font-thin text-primary">{{ newCards }}</span>
              <span class="text-[9px] font-medium uppercase tracking-[0.2em] text-on-surface/40">New</span>
            </div>
            <div class="flex flex-col">
              <span class="text-2xl font-thin text-on-surface/80">{{ knownCards }}</span>
              <span class="text-[9px] font-medium uppercase tracking-[0.2em] text-on-surface/40">Known</span>
            </div>
          </div>
        </div>
        <AppButton size="lg" @click="$emit('reviewNow')">Review Now</AppButton>
      </div>
    </div>
  </div>
</template>
