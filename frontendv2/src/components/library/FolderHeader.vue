<script setup lang="ts">
//import AppButton from '@/components/AppButton.vue'

defineProps<{
  title: string
  notes: number
  totalCards: number
  dueToday: number
}>()

defineEmits<{
  reviewAll: []
  more: []
}>()
</script>

<template>
  <section class="flex flex-col md:flex-row md:items-end justify-between gap-8">
    <!--<div class="space-y-4">-->
      <h1 class="text-6xl font-thin tracking-tighter text-on-surface">
        <span
          class="material-symbols-outlined text-7xl mr-4 align-bottom"
          style="font-variation-settings: 'FILL' 1, 'wght' 200;"
        >folder</span>
        {{ title }}
      </h1>
      <div class="flex items-center gap-8">
        <div class="flex flex-col">
          <span class="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">Notes</span>
          <span class="text-3xl font-extralight">{{ notes.toLocaleString() }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">Total Cards</span>
          <span class="text-3xl font-extralight">{{ totalCards.toLocaleString() }}</span>
        </div>
        <div class="flex flex-col border-l border-outline-variant/20 pl-8">
          <span class="text-[10px] font-bold uppercase tracking-[0.3em] text-error/80">Due Today</span>
          <span class="text-3xl font-extralight text-error">{{ dueToday }}</span>
        </div>
      </div>
    <!--</div>-->

    <!--<div class="flex items-center gap-3">
      <AppButton size="lg" icon="play_arrow" icon-filled @click="$emit('reviewAll')">Review All</AppButton>
    </div>-->
  </section>
</template>
