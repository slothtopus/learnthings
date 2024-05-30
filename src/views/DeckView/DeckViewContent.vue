<script setup lang="ts">
import DeckViewDetailsSection from './DeckViewDetailsSection.vue'
import DeckViewNoteTypesSection from './DeckViewNoteTypesSection.vue'

import type { Deck } from '@/lib/Deck'

interface Props {
  deck: Deck
}
defineProps<Props>()
</script>

<template>
  <DeckViewDetailsSection :deck="deck" />
  <DeckViewNoteTypesSection :deck="deck" />
</template>

<style scoped></style>
