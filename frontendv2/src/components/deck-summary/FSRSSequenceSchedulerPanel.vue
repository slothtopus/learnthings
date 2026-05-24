<script setup lang="ts">
import { computed } from 'vue'
import SchedulerPanel from './SchedulerPanel.vue'
import type { FSRSSequence } from 'core/schedulers/FSRSSequence.js'

const props = defineProps<{ scheduler: FSRSSequence }>()
defineEmits<{ reviewNow: [], change: [] }>()

const cardCount = computed(() => props.scheduler.deck.getAllCards().length)
</script>

<template>
  <SchedulerPanel
    :scheduler-name="scheduler.label"
    :show-settings="false"
    @review-now="$emit('reviewNow')"
    @change="$emit('change')"
  >
    <div class="px-6 py-8 flex flex-col items-center gap-2">
      <span class="text-3xl font-light text-on-surface leading-none">{{ cardCount }}</span>
      <span class="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50">Total Cards</span>
    </div>
  </SchedulerPanel>
</template>
