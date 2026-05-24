<script setup lang="ts">
import { computed } from 'vue'
import type { SchedulerStatistics } from 'core/schedulers/FSRSScheduler.js'

const props = defineProps<{
  statistics: SchedulerStatistics
}>()

const total = computed(() =>
  props.statistics.due.new +
  props.statistics.due.seen +
  props.statistics.not_due.new +
  props.statistics.not_due.seen,
)
const pct = (n: number) => total.value > 0 ? (n / total.value) * 100 : 0
const notDueTotal = computed(() => props.statistics.not_due.new + props.statistics.not_due.seen)
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Bar -->
    <div class="flex h-5 rounded-xs overflow-hidden gap-[2px] bg-surface-container-lowest">
      <div
        v-if="statistics.due.new > 0"
        class="bg-primary transition-all duration-500 shrink-0"
        :style="{ width: pct(statistics.due.new) + '%' }"
      />
      <div
        v-if="statistics.due.seen > 0"
        class="bg-primary/35 transition-all duration-500 shrink-0"
        :style="{ width: pct(statistics.due.seen) + '%' }"
      />
      <div
        v-if="notDueTotal > 0"
        class="bg-white/8 flex-1"
      />
    </div>

    <!-- Legend -->
    <div class="flex items-center gap-6 flex-wrap mt-1">
      <div class="flex items-center gap-2">
        <div class="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
        <span class="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50">
          Due: New
          <span class="text-primary ml-1">{{ statistics.due.new }}</span>
        </span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-2.5 h-2.5 rounded-full bg-primary/35 shrink-0" />
        <span class="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50">
          Due: Seen
          <span class="text-primary/60 ml-1">{{ statistics.due.seen }}</span>
        </span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-2.5 h-2.5 rounded-full bg-white/15 shrink-0" />
        <span class="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50">
          Unseen
          <span class="text-on-surface-variant ml-1">{{ notDueTotal }}</span>
        </span>
      </div>
    </div>
  </div>
</template>
