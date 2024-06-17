<script setup lang="ts">
import { onMounted } from 'vue'

import MasterLayout from './layouts/MasterLayout.vue'
import SectionLayout from './layouts/SectionLayout.vue'

import LtDeck from '@/components/LtDeck.vue'
import { Button } from '@/components/shadcn-ui/button'

import { useDecksStore } from '@/stores/decks'

const decksStore = useDecksStore()
onMounted(decksStore.refreshDecks)
</script>

<template>
  <MasterLayout :loading="decksStore.loading">
    <template #title>Decks</template>
    <template #content>
      <SectionLayout>
        <template #controls
          ><Button @click="decksStore.createNewDeck">Create new deck</Button></template
        >
        <template #content
          ><div class="grid grid-cols-[repeat(auto-fill,18rem)] justify-center gap-6">
            <LtDeck
              v-for="deck in decksStore.decks"
              :key="deck.id"
              :deck="deck"
              @edit="$router.push({ name: 'edit-deck', params: { deckId: deck.id } })"
              @add="
                $router.push({
                  name: 'new-note',
                  params: { deckId: deck.id, noteTypeId: deck.noteTypes[0].id }
                })
              "
              @view="
                $router.push({
                  name: 'view-notes',
                  params: { deckId: deck.id }
                })
              "
              @delete="decksStore.deleteDeck(deck.id)"
              @study="$router.push({ name: 'study', params: { deckId: deck.id } })"
            /></div
        ></template>
      </SectionLayout>
    </template>
  </MasterLayout>
</template>

<style scoped></style>
