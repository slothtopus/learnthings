<script setup lang="ts">
import { computed } from 'vue'

import PageLayout from '@/components/used/PageLayout.vue'
import DeckHeader from '@/components/used/DeckHeader.vue'
import FSRSSchedulerPanel from '@/components/deck-summary/FSRSSchedulerPanel.vue'
import FSRSSequenceSchedulerPanel from '@/components/deck-summary/FSRSSequenceSchedulerPanel.vue'
import NoteTypeSection from '@/components/deck-summary/NoteTypeSection.vue'

import { useDeckDetails } from '@/composables/useObjectDetails'
import { useRouteMetaObjects } from '@/composables/useRouteObjects'
import { useFormDialog } from '@/composables/useFormDialog'
import { FSRSScheduler } from 'core/schedulers/FSRSScheduler.js'
import { FSRSSequence } from 'core/schedulers/FSRSSequence.js'
import SelectSchedulerForm from '@/components/SelectSchedulerForm.vue'
import type { SelectSchedulerFormData } from '@/components/SelectSchedulerForm.vue'

const { getDeck } = useRouteMetaObjects()
const deck = getDeck()

const { noteCount, cardCount } = useDeckDetails(deck)

const breadcrumbs = computed(() => [
  { label: 'Library', href: '/' },
  { label: `Deck: ${deck.name}`, href: '#' },
])

const scheduler = computed(() => deck.getActiveScheduler())
const isFSRS = (s: typeof scheduler.value): s is FSRSScheduler => s instanceof FSRSScheduler
const isFSRSSequence = (s: typeof scheduler.value): s is FSRSSequence => s instanceof FSRSSequence

const selectSchedulerDialog = useFormDialog<SelectSchedulerFormData>(SelectSchedulerForm)

const handleChangeScheduler = async () => {
  const result = await selectSchedulerDialog.open({ scheduler: scheduler.value.subtype })
  if (result.cancelled) return
  switch (result.data.scheduler) {
    case FSRSScheduler.subtype: deck.setActiveScheduler(FSRSScheduler); break
    case FSRSSequence.subtype:  deck.setActiveScheduler(FSRSSequence);  break
  }
  await deck.persist()
}
</script>

<template>
  <PageLayout :breadcrumbs="breadcrumbs">
    <template #title>Deck Summary</template>

    <div class="mt-6 pb-12">
      <DeckHeader
        :title="deck.name"
        description="Description goes here"
        :notes="noteCount"
        :total-cards="cardCount"
        class="mb-12"
      />

      <div class="flex flex-col gap-12">
        <!-- Scheduler -->
        <section class="space-y-6">
          <h2 class="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface/40 px-1">
            Scheduler
          </h2>
          <FSRSSchedulerPanel
            v-if="isFSRS(scheduler)"
            :scheduler="scheduler"
            @review-now="$router.push({ name: 'start-review', params: { deckId: deck.id } })"
            @change="handleChangeScheduler"
          />
          <FSRSSequenceSchedulerPanel
            v-else-if="isFSRSSequence(scheduler)"
            :scheduler="scheduler"
            @review-now="$router.push({ name: 'start-review', params: { deckId: deck.id } })"
            @change="handleChangeScheduler"
          />
        </section>
        <NoteTypeSection />
      </div>
    </div>
  </PageLayout>
</template>
