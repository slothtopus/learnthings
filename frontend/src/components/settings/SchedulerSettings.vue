<script setup lang="ts">
import { Card } from 'primevue'

import HeaderSection from '@/components/common/HeaderSection.vue'
import FieldContainer from '@/components/common/FieldContainer.vue'
import SelectSchedulerForm from '@/components/forms/SelectSchedulerForm.vue'
import type { FormData } from '@/components/forms/SelectSchedulerForm.vue'

import { useFormDialog } from '@/composables/useFormDialog'

import type { Deck } from 'core/Deck.js'
import { FSRSScheduler } from 'core/schedulers/FSRSScheduler.js'
import { FSRSSequence } from 'core/schedulers/FSRSSequence.js'

interface Props {
  deck: Deck
}
const props = defineProps<Props>()

const { openDialog } = useFormDialog<FormData>(SelectSchedulerForm, 'Select scheduler')

const handleChangeScheduler = async () => {
  const result = await openDialog()
  if (!result.cancelled) {
    const { scheduler } = result.data
    switch (scheduler) {
      case 'fsrs':
        props.deck.setActiveScheduler(FSRSScheduler)
        break
      case 'fsrs_sequence':
        props.deck.setActiveScheduler(FSRSSequence)
    }
    await props.deck.persist()
  }
}
</script>

<template>
  <HeaderSection title="Scheduler" />
  <Card class="border dark:border-gray-500 w-full">
    <template #content>
      <FieldContainer
        subtitle="Name"
        :title="deck.getActiveScheduler().label"
        :controls="['edit']"
        @edit="handleChangeScheduler"
      />
    </template>
  </Card>
</template>

<style scoped></style>
