<script setup lang="ts">
import AppButton from '@/components/AppButton.vue'
import AppIconButton from '@/components/AppIconButton.vue'

defineProps<{
  title: string
  description: string
  notes: number
  cards: number
  due: number
}>()

defineEmits<{
  review: []
  manage: []
  delete: []
}>()
</script>

<template>
  <div class="bg-surface-container-high p-6 flex flex-col lg:grid lg:grid-cols-[1fr_240px_auto] items-center gap-8 transition-all duration-300 rounded-md border border-outline-variant/10 hover:border-primary/20 hover:bg-surface-container-highest group cursor-pointer"
  @click="$emit('manage')">
    <!-- Title & description -->
    <div class="w-full">
      <div class="flex items-center gap-3 mb-1">
        <span class="material-symbols-outlined text-primary text-xl">style</span>
        <h3 class="text-xl font-extralight text-on-surface group-hover:text-primary transition-colors">{{ title }}</h3>
      </div>
      <p class="text-xs text-on-surface/40 leading-relaxed line-clamp-1">{{ description }}</p>
    </div>

    <!-- Stats -->
    <div class="flex items-center justify-end w-full">
      <div class="w-20 flex flex-col items-center">
        <span class="text-[9px] font-medium uppercase tracking-[0.2em] text-on-surface/40 mb-1">Notes</span>
        <span class="text-base font-thin">{{ notes }}</span>
      </div>
      <div class="w-20 flex flex-col items-center">
        <span class="text-[9px] font-medium uppercase tracking-[0.2em] text-on-surface/40 mb-1">Cards</span>
        <span class="text-base font-thin">{{ cards }}</span>
      </div>
      <div class="w-20 flex flex-col items-center border-l border-white/10">
        <span class="text-[9px] font-medium uppercase tracking-[0.2em] text-primary/80 mb-1">Due</span>
        <span class="text-base font-thin text-primary">{{ due }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2 shrink-0 justify-end">
      <AppButton size="sm" @click="$emit('review')">Review</AppButton>
      <!--<AppButton size="sm" variant="secondary" @click="$emit('manage')">Manage</AppButton>-->
      <div class="w-px h-6 bg-white/10 mx-1" />
      <AppIconButton icon="delete" variant="destructive" @click.stop="$emit('delete')" />
    </div>
  </div>
</template>
