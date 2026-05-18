<script setup lang="ts">
import { ref } from 'vue'
import PageLayout from '@/components/PageLayout.vue'
import DeckHeader from '@/components/DeckHeader.vue'
import SchedulerPanel from '@/components/SchedulerPanel.vue'
import NoteTypeCard from '@/components/NoteTypeCard.vue'
import CreateButton from '@/components/CreateButton.vue'
import CreateNoteTypeDialog from '@/components/CreateNoteTypeDialog.vue'
import LinkButton from '@/components/LinkButton.vue'

const showCreateNoteType = ref(false)

const breadcrumbs = [
  { label: 'Library', href: '#' },
  { label: 'Medicine', href: '#' },
  { label: 'Anatomy' },
]

const deck = {
  title: 'Anatomy',
  description: 'A comprehensive archive of human biological systems, musculoskeletal frameworks, and physiological pathways designed for surgical precision.',
  notes: 1200,
  totalCards: 4500,
}

const scheduler = {
  schedulerName: 'FSRS Sequence',
  cardsDue: 152,
  newCards: 42,
  knownCards: 110,
}

const noteTypes = [
  { title: 'Vocabulary', notes: 800, cards: 2400 },
  { title: 'Image Occlusion', notes: 400, cards: 2100 },
]
</script>

<template>
  <PageLayout :breadcrumbs="breadcrumbs">
    <template #title>Deck Summary</template>

    <div class="mt-6 pb-12">
      <DeckHeader
        :title="deck.title"
        :description="deck.description"
        :notes="deck.notes"
        :total-cards="deck.totalCards"
        class="mb-12"
      />

      <div class="flex flex-col gap-12">
        <!-- Scheduler -->
        <section class="space-y-6">
          <h2 class="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface/40 px-1">Scheduler</h2>
          <SchedulerPanel v-bind="scheduler" />
        </section>

        <!-- Note types -->
        <section class="space-y-6">
          <div class="flex items-center justify-between px-1">
            <h2 class="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface/40">Note Types</h2>
            <LinkButton label="Browse All Notes" />
          </div>

          <div class="flex flex-col gap-4">
            <NoteTypeCard
              v-for="nt in noteTypes"
              :key="nt.title"
              :title="nt.title"
              :notes="nt.notes"
              :cards="nt.cards"
            />

            <CreateButton label="New Note Type" size="lg" @click="showCreateNoteType = true" />
          </div>
        </section>
      </div>
    </div>

    <CreateNoteTypeDialog
      :show="showCreateNoteType"
      @close="showCreateNoteType = false"
      @create="showCreateNoteType = false"
    />
  </PageLayout>
</template>
