<script setup lang="ts">
import { computed } from 'vue'

import PageLayout from '@/components/used/PageLayout.vue'
import DeckHeader from '@/components/used/DeckHeader.vue'
import SchedulerPanel from '@/components/used/SchedulerPanel.vue'
import NoteTypeSection from '@/components/deck-summary/NoteTypeSection.vue'

import { useDeckDetails } from '@/composables/useObjectDetails'
import { useRouteMetaObjects } from '@/composables/useRouteObjects'

const { getDeck } = useRouteMetaObjects()
const deck = getDeck()

const { noteCount, cardCount } = useDeckDetails(deck)

const breadcrumbs = computed(() => [
  { label: 'Library', href: '/' },
  { label: `Deck: ${deck.name}`, href: '#' },
])

const scheduler = {
  schedulerName: 'FSRS Sequence',
  cardsDue: 152,
  newCards: 42,
  knownCards: 110,
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
          <SchedulerPanel v-bind="scheduler" @review-now="$router.push({name: 'start-review', params: {deckId: deck.id}})"/>
        </section>
        <NoteTypeSection />
      </div>
    </div>
  </PageLayout>
</template>
