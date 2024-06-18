<script setup lang="ts">
import { onMounted } from 'vue'

import MasterLayout from './layouts/MasterLayout.vue'
import SectionLayout from './layouts/SectionLayout.vue'

import LtDeck2 from '@/components/LtDeck2.vue'

//import LtDeck from '@/components/LtDeck.vue'
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
        <template #title>All decks</template>
        <template #controls
          ><Button @click="decksStore.createNewDeck">Create new deck</Button></template
        >
        <template #content>
          <div class="flex flex-col gap-5">
            <LtDeck2
              v-for="deck in decksStore.decks"
              :key="deck.id"
              :deck="deck"
              @settings="$router.push({ name: 'settings-deck', params: { deckId: deck.id } })"
              @add="
                $router.push({
                  name: 'new-note',
                  params: { deckId: deck.id, noteTypeId: deck.noteTypes[0].id }
                })
              "
              @browse="
                $router.push({
                  name: 'browse-notes',
                  params: { deckId: deck.id }
                })
              "
              @delete="decksStore.deleteDeck(deck.id)"
              @study="$router.push({ name: 'study', params: { deckId: deck.id } })"
            />
          </div>
        </template>
      </SectionLayout>
    </template>
  </MasterLayout>
</template>

<style scoped></style>
