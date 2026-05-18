<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  notes: number
  totalCards: number
}>()
</script>

<template>
  <section class="flex flex-col md:flex-row md:items-start md:justify-between gap-12 border-b border-outline-variant/10 pb-12">
    <div class="flex-1 space-y-6">
      <h1 class="text-4xl md:text-6xl font-thin tracking-tighter text-on-surface">{{ title }}</h1>
      <p v-if="description" class="text-lg font-light text-on-surface-variant/60 max-w-2xl leading-relaxed">
        {{ description }}
      </p>
    </div>
    <div class="flex items-center gap-12 md:pt-4">
      <div class="flex flex-col">
        <span class="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">Total Notes</span>
        <span class="text-3xl font-extralight">{{ notes.toLocaleString() }}</span>
      </div>
      <div class="flex flex-col">
        <span class="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">Total Cards</span>
        <span class="text-3xl font-extralight">{{ totalCards.toLocaleString() }}</span>
      </div>
    </div>
  </section>
</template>
