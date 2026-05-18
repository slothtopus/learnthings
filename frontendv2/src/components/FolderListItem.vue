<script setup lang="ts">
import AppButton from '@/components/AppButton.vue'
import AppIconButton from '@/components/AppIconButton.vue'

defineProps<{
  title: string
  deckCount: number
  subfolderCount: number
  notes: number
  total: number
  due: number
}>()

defineEmits<{
  reviewAll: []
  open: []
}>()
</script>

<template>
  <div class="bg-surface-container p-6 flex flex-col lg:grid lg:grid-cols-[1fr_240px_240px] items-center gap-8 transition-all duration-300 rounded-md border border-outline-variant/10 hover:border-primary/20 hover:bg-surface-container-high group">
    <!-- Title & meta -->
    <div class="w-full">
      <div class="flex items-center gap-3 mb-1">
        <span class="material-symbols-outlined text-primary text-xl" style="font-variation-settings: 'FILL' 1;">folder</span>
        <h3 class="text-xl font-extralight text-on-surface group-hover:text-primary transition-colors">{{ title }}</h3>
      </div>
      <p class="text-[11px] font-medium text-on-surface/40 uppercase tracking-widest">
        {{ deckCount }} Deck{{ deckCount !== 1 ? 's' : '' }} • {{ subfolderCount }} Subfolder{{ subfolderCount !== 1 ? 's' : '' }}
      </p>
    </div>

    <!-- Stats -->
    <div class="flex items-center justify-end w-full">
      <div class="w-20 flex flex-col items-center">
        <span class="text-[9px] font-medium uppercase tracking-[0.2em] text-on-surface/40 mb-1">Notes</span>
        <span class="text-base font-thin">{{ notes }}</span>
      </div>
      <div class="w-20 flex flex-col items-center">
        <span class="text-[9px] font-medium uppercase tracking-[0.2em] text-on-surface/40 mb-1">Total</span>
        <span class="text-base font-thin">{{ total.toLocaleString() }}</span>
      </div>
      <div class="w-20 flex flex-col items-center border-l border-white/10">
        <span class="text-[9px] font-medium uppercase tracking-[0.2em] text-primary/80 mb-1">Due</span>
        <span class="text-base font-thin text-primary">{{ due }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2 shrink-0 justify-end w-full">
      <AppButton size="sm" @click="$emit('reviewAll')">Review All</AppButton>
      <AppIconButton icon="chevron_right" @click="$emit('open')" />
    </div>
  </div>
</template>
