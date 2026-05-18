<script setup lang="ts">
import AppButton from '@/components/AppButton.vue'
import LinkButton from '@/components/LinkButton.vue'

defineProps<{
  title: string
  notes: number
  cards: number
}>()

defineEmits<{
  new: []
  settings: []
  delete: []
  browse: []
}>()
</script>

<template>
  <div class="bg-surface-container-high rounded-md p-6 pr-16 transition-all duration-300 hover:bg-surface-container-highest group border border-outline-variant/10 hover:border-primary/20 relative overflow-hidden">
    <!-- Right-side stacked icon actions -->
    <div class="absolute inset-y-0 right-0 w-12 flex flex-col items-center justify-center border-l border-outline-variant/10 bg-surface-container-highest/20">
      <button
        class="flex-1 w-full flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors text-on-surface/40 border-b border-outline-variant/10"
        @click="$emit('settings')"
      >
        <span class="material-symbols-outlined text-lg">settings</span>
      </button>
      <button
        class="flex-1 w-full flex items-center justify-center hover:bg-error/10 hover:text-error transition-colors text-on-surface/40"
        @click="$emit('delete')"
      >
        <span class="material-symbols-outlined text-lg">delete</span>
      </button>
    </div>

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="flex-1">
        <h3 class="text-xl font-extralight text-on-surface group-hover:text-primary transition-colors mb-2">
          {{ title }}
        </h3>
        <p class="text-[11px] font-medium text-on-surface/40 uppercase tracking-widest">
          {{ notes.toLocaleString() }} Notes • {{ cards.toLocaleString() }} Cards
        </p>
        <LinkButton :label="`Browse All ${title} Notes`" class="mt-2" @click="$emit('browse')" />
      </div>
      <AppButton size="sm" @click="$emit('new')">New</AppButton>
    </div>
  </div>
</template>
