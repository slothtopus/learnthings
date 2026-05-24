<script setup lang="ts">
import { computed } from 'vue'
import SchedulerPanel from './SchedulerPanel.vue'
import CardCountBar from '@/components/CardCountBar.vue'
import FSRSSettingsForm from '@/components/FSRSSettingsForm.vue'
import { useFormDialog } from '@/composables/useFormDialog'
import type { FSRSScheduler } from 'core/schedulers/FSRSScheduler.js'
import type { FRSROptions } from 'core/schedulers/FSRSScheduler.js'

const props = defineProps<{ scheduler: FSRSScheduler }>()
defineEmits<{ reviewNow: [], change: [] }>()

const cards = computed(() => props.scheduler.deck.getAllCards())
const statistics = computed(() => props.scheduler.getStatistics(cards.value))

const settingsDialog = useFormDialog<FRSROptions>(FSRSSettingsForm)

const handleSettings = async () => {
  const result = await settingsDialog.open({ ...props.scheduler.options })
  if (result.cancelled) return
  props.scheduler.updateOptions(result.data)
  await props.scheduler.deck.persist()
}
</script>

<template>
  <SchedulerPanel
    :scheduler-name="scheduler.label"
    @review-now="$emit('reviewNow')"
    @change="$emit('change')"
    @settings="handleSettings"
    :show-settings="true"
  >
    <div class="px-6 py-8">
      <CardCountBar :statistics="statistics" />
    </div>
  </SchedulerPanel>
</template>
