<script setup lang="ts">
import { ref } from 'vue'
import { Menu, Button } from 'primevue'

import AppFrameScrollLayout from '@/layouts/AppFrameScrollLayout.vue'
import HeaderSection from '@/components/common/HeaderSection.vue'
import CreateNewNamedObjectForm from '@/components/forms/CreateNewNamedObjectForm.vue'
import type { FormData } from '@/components/forms/CreateNewNamedObjectForm.vue'
import DeckCard from '@/components/DeckCard.vue'

import { freezeAll, unfreezeAll } from '@/composables/useObjectDetails'
import { useDecks, usePersistDeck } from '@/composables/useDecks'
import { createCountriesAndCapitals } from '@/lib/build-capitals-deck'
import { createFlagsDeck } from '@/lib/build-flags-deck'
import { useFormDialog } from '@/composables/useFormDialog'
import { useConfirmation } from '@/composables/useConfirmationDialog'
import { createLittlePrince } from '@/lib/build-little-prince-deck'

const { decks, newDeck, deleteDeck } = useDecks()

const { openDialog } = useFormDialog<FormData>(CreateNewNamedObjectForm, 'Create new deck')
const handleCreateNewDeck = async () => {
  const result = await openDialog()
  if (result.cancelled) return
  const { name } = result.data
  await newDeck(name)
}

const importMenu = ref<{ toggle: (e: any) => void } | null>(null)
const toggleImportMenu = (event: any) => {
  importMenu.value?.toggle(event)
}

const importMenuItems = [
  {
    icon: 'pi pi-book',
    label: 'Countries and Capitals',
    command: () => {
      createTestDeck('countries')
    },
  },
  {
    icon: 'pi pi-book',
    label: 'Flags of the World',
    command: () => {
      createTestDeck('flags')
    },
  },
  {
    icon: 'pi pi-book',
    label: 'O Pequeno Príncipe',
    command: () => {
      createTestDeck('prince')
    },
  },
]

const { persistDeck } = usePersistDeck()

const createTestDeck = async (name: 'countries' | 'flags' | 'prince') => {
  const deck = await newDeck('')
  freezeAll()
  if (name === 'countries') {
    await createCountriesAndCapitals(deck)
  } else if (name === 'flags') {
    await createFlagsDeck(deck)
  } else {
    await createLittlePrince(deck)
  }
  await persistDeck(deck, 'Importing')
  unfreezeAll()
}

const { confirm } = useConfirmation()
const handleDelete = async (deckId: string) => {
  if (await confirm('Delete deck', 'Are you sure you want to delete this deck?')) {
    await deleteDeck(deckId)
  }
}
</script>

<template>
  <AppFrameScrollLayout :breadcrumbs="[]">
    <template #content>
      <HeaderSection title="Decks">
        <template #controls>
          <Button
            class="ml-4 flex-none"
            outlined
            text
            icon="pi pi-plus"
            label="New"
            :pt="{ label: 'hidden sm:block' }"
            @click="handleCreateNewDeck"
          />
          <Button
            class="flex-none"
            outlined
            text
            icon="pi pi-upload"
            label="Import"
            :pt="{ label: 'hidden sm:block' }"
            aria-haspopup="true"
            aria-controls="import-menu"
            @click="toggleImportMenu"
          />
          <Menu ref="importMenu" id="import-menu" :model="importMenuItems" :popup="true" />
        </template>
      </HeaderSection>
      <DeckCard
        v-for="deck in decks"
        :deck="deck"
        :key="deck.name"
        @delete="handleDelete(deck.id)"
      />
    </template>
  </AppFrameScrollLayout>
</template>

<style scoped></style>
