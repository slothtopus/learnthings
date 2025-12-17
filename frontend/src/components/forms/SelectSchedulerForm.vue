<script setup lang="ts">
import { computed } from 'vue'

import { Button, Select } from 'primevue'

import { useFormDialogData } from '@/composables/useFormDialog'

import { FSRSScheduler } from 'core/schedulers/FSRSScheduler.js'
import {FSRSSequence} from 'core/schedulers/FSRSSequence.js'

export type FormData = { scheduler: (typeof schedulers)[number]['id'] }

const { formData } = useFormDialogData<FormData>({ scheduler: 'fsrs' })

defineEmits<{
  update: [data: FormData]
  cancel: [value: void]
}>()

const schedulers = [
  { name: FSRSScheduler.label, id: FSRSScheduler.subtype },
  { name: FSRSSequence.label, id: FSRSSequence.subtype },
] as const
type SchedulerOption = (typeof schedulers)[number]

const selectedFieldType = computed({
  get: () => {
    return schedulers.find((f) => f.id == formData.value.scheduler)
  },
  set: (opt: SchedulerOption) => {
    formData.value.scheduler = opt.id
  },
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <label for="min-review-interval" class="font-thin block mb-2">Scheduler</label>
      <Select v-model="selectedFieldType" :options="(schedulers as any)" optionLabel="name" fluid />
    </div>
    <div class="mt-6 flex gap-4 justify-end">
      <Button label="Create" size="small" @click="$emit('update', formData)" />
      <Button label="Cancel" size="small" severity="secondary" @click="$emit('cancel')" />
    </div>
  </div>
</template>

<style scoped></style>
