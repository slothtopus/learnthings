<script setup lang="ts">
import { computed } from 'vue'
import SchedulerPanel from './SchedulerPanel.vue'
import type { WeightedRandomScheduler } from 'core/schedulers/WeightedRandomScheduler.js'

const props = defineProps<{ scheduler: WeightedRandomScheduler }>()
defineEmits<{ reviewNow: [], change: [] }>()

const stats = computed(() => {
  const cards = props.scheduler.deck.getAllCards()
  return props.scheduler.getStatistics(cards)
})
</script>

<template>
  <SchedulerPanel
    :scheduler-name="scheduler.label"
    :show-settings="false"
    @review-now="$emit('reviewNow')"
    @change="$emit('change')"
  >
    <div class="px-6 py-8 flex items-center justify-around gap-4">
      <div class="flex flex-col items-center gap-1">
        <span class="text-3xl font-light text-primary leading-none">{{ stats.unseen }}</span>
        <span class="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50">Unseen</span>
      </div>
      <div class="w-px h-8 bg-white/5" />
      <div class="flex flex-col items-center gap-1">
        <span class="text-3xl font-light text-on-surface leading-none">{{ stats.seen }}</span>
        <span class="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50">Seen</span>
      </div>
      <div class="w-px h-8 bg-white/5" />
      <div class="flex flex-col items-center gap-1">
        <span class="text-3xl font-light text-on-surface/40 leading-none">{{ stats.recentlySeen }}</span>
        <span class="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50">Recent</span>
      </div>
    </div>
  </SchedulerPanel>
</template>
