<script setup lang="ts">
import FormDialog from '@/components/used/FormDialog.vue'
import OptionListItem from '@/components/OptionListItem.vue'
import { useDialogForm } from '@/composables/useFormDialog'
import { FSRSScheduler } from 'core/schedulers/FSRSScheduler.js'
import { FSRSSequence } from 'core/schedulers/FSRSSequence.js'

export type SelectSchedulerFormData = {
  scheduler: string
}

const { formData, hasChanged, submit, cancel } = useDialogForm<SelectSchedulerFormData>()

const options = [
  {
    id: FSRSScheduler.subtype,
    label: FSRSScheduler.label,
    icon: 'psychology',
    description: 'Adaptive spaced repetition that optimises review intervals based on memory stability.',
  },
  {
    id: FSRSSequence.subtype,
    label: FSRSSequence.label,
    icon: 'playlist_play',
    description: 'Cycles through all cards in a fixed sequence without adaptive scheduling.',
  },
] as const
</script>

<template>
  <FormDialog
    title="Scheduler"
    submit-label="Apply"
    :submit-disabled="!hasChanged"
    @close="cancel"
    @submit="submit"
  >
    <div class="flex flex-col gap-2">
      <OptionListItem
        v-for="option in options"
        :key="option.id"
        :icon="option.icon"
        :label="option.label"
        :description="option.description"
        :selected="formData.scheduler === option.id"
        @select="formData.scheduler = option.id"
      />
    </div>
  </FormDialog>
</template>
