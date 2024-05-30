<script setup lang="ts">
import MasterLayout from './MasterLayout.vue'
import SectionLayout from './SectionLayout.vue'

import LtDeck from '@/components/LtDeck.vue'
import { Button } from '@/components/ui/button'

import { useDecksStore } from '@/stores/decks'

const decksStore = useDecksStore()
</script>

<template>
  <MasterLayout>
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
              @delete="decksStore.deleteDeck(deck)"
            /></div
        ></template>
      </SectionLayout>
    </template>
  </MasterLayout>
</template>

<style scoped></style>
