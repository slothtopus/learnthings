<script setup lang="ts">
import { useDecks } from '@/composables/usePouchRegistry'
import { useFormDialog } from '@/composables/useFormDialog'
import { useConfirmation } from '@/composables/useConfirmationDialog'

import PageLayout from '@/components/used/PageLayout.vue'
import FolderHeader from '@/components/used/FolderHeader.vue'
import DeckListItem from '@/components/used/DeckListItem.vue'
import CreateButton from '@/components/used/CreateButton.vue'
import AppInput from '@/components/used/AppInput.vue'

import CreateNewDeckDialog from '@/components/library/CreateNewDeckDialog.vue'
import type { CreateNewDeckDetails } from '@/components/library/CreateNewDeckDialog.vue'

const breadcrumbs = [
  { label: 'Library', href: '/' },
  { label: 'All Decks', href: '/' },
]

const { decks, newDeck, deleteDeck } = useDecks()

const dialog = useFormDialog<CreateNewDeckDetails>(CreateNewDeckDialog)
const handleCreateNewDeck = async () => {
  const result = await dialog.open({ name: '', description: '' })
  if (!result.cancelled) {
    await newDeck(result.data.name)
  }
}

const { showConfirmation } = useConfirmation()
const handleDelete = async (deckId: string) => {
  if (await showConfirmation('Delete deck', 'Are you sure you want to delete this deck?')) {
    await deleteDeck(deckId)
  }
}
</script>

<template>
  <PageLayout :breadcrumbs="breadcrumbs">
    <template #title>Library</template>

    <div class="mt-6 pb-20">
      <!-- Folder header -->
      <FolderHeader title="All Decks" :notes="0" :total-cards="0" :due-today="0" class="mb-12" />

      <!-- Search -->
      <section class="mb-6">
        <AppInput placeholder="Search by name..." icon="search" />
      </section>

      <!-- Create actions -->
      <section class="mb-6">
        <CreateButton label="Create New Deck" @click="handleCreateNewDeck" />
      </section>

      <!-- List -->
      <section class="space-y-3">
        <DeckListItem
          v-for="deck in decks"
          :key="deck.id"
          :title="deck.name"
          description="Description goes here"
          :notes="deck.getAllNotes().length"
          :cards="deck.getAllCards().length"
          :due="0"
          @delete="handleDelete(deck.id)"
          @manage="$router.push({name: 'deck-summary', params: {deckId: deck.id}})"
          @review="$router.push({name: 'start-review', params: {deckId: deck.id}})"
        />
      </section>
    </div>
  </PageLayout>
</template>
