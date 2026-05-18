<script setup lang="ts">
import { ref } from 'vue'
import PageLayout from '@/components/PageLayout.vue'
import FolderHeader from '@/components/FolderHeader.vue'
import DeckListItem from '@/components/DeckListItem.vue'
import FolderListItem from '@/components/FolderListItem.vue'
import CreateButton from '@/components/CreateButton.vue'
import CreateDeckDialog from '@/components/CreateDeckDialog.vue'
import AppInput from '@/components/AppInput.vue'

const showCreateDeck = ref(false)

const breadcrumbs = [
  { label: 'Library', href: '#' },
  { label: 'Medicine', href: '#' },
  { label: 'Anatomy' },
]

const folder = {
  title: 'Anatomy',
  notes: 1200,
  totalCards: 4500,
  dueToday: 88,
}

type DeckItem = { type: 'deck'; title: string; description: string; notes: number; total: number; due: number }
type FolderItem = { type: 'folder'; title: string; deckCount: number; subfolderCount: number; notes: number; total: number; due: number }
type LibraryItem = DeckItem | FolderItem

const items: LibraryItem[] = [
  {
    type: 'deck',
    title: 'Cardiac Vasculature',
    description: 'Comprehensive study of arterial supply and venous drainage of the myocardium including coronary variants.',
    notes: 245,
    total: 890,
    due: 12,
  },
  {
    type: 'folder',
    title: 'Musculoskeletal',
    deckCount: 8,
    subfolderCount: 0,
    notes: 312,
    total: 1250,
    due: 24,
  },
  {
    type: 'folder',
    title: 'Neuroanatomy',
    deckCount: 14,
    subfolderCount: 3,
    notes: 450,
    total: 1890,
    due: 52,
  },
  {
    type: 'deck',
    title: 'Pulmonary Mechanics',
    description: 'Lung volumes, capacities, and the physical principles of ventilation and gas exchange.',
    notes: 112,
    total: 450,
    due: 45,
  },
]
</script>

<template>
  <PageLayout :breadcrumbs="breadcrumbs">
    <template #title>Library</template>

    <div class="mt-6 pb-20">
      <!-- Folder header -->
      <FolderHeader
        :title="folder.title"
        :notes="folder.notes"
        :total-cards="folder.totalCards"
        :due-today="folder.dueToday"
        class="mb-12"
      />

      <!-- Search -->
      <section class="mb-6">
        <AppInput placeholder="Search by name..." icon="search" />
      </section>

      <!-- Create actions -->
      <section class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <CreateButton label="Create New Deck" @click="showCreateDeck = true" />
        <CreateButton icon="create_new_folder" label="Create New Folder" />
      </section>

      <!-- List -->
      <section class="space-y-3">
        <template v-for="item in items" :key="item.title">
          <DeckListItem
            v-if="item.type === 'deck'"
            :title="item.title"
            :description="item.description"
            :notes="item.notes"
            :total="item.total"
            :due="item.due"
          />
          <FolderListItem
            v-else
            :title="item.title"
            :deck-count="item.deckCount"
            :subfolder-count="item.subfolderCount"
            :notes="item.notes"
            :total="item.total"
            :due="item.due"
          />
        </template>
      </section>
    </div>

    <CreateDeckDialog
      :show="showCreateDeck"
      @close="showCreateDeck = false"
      @create="showCreateDeck = false"
    />
  </PageLayout>
</template>
