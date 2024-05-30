<script setup lang="ts">
import MasterLayout from '@/views/layouts/MasterLayout.vue'

import CardTemplateContent from './CardTemplateContent.vue'
import { Button } from '@/components/shadcn-ui/button'

import { useDecksStore } from '@/stores/decks'
const decksStore = useDecksStore()

interface Props {
  deckId: string
  noteTypeId: string
  cardTemplateId: string
}
const props = defineProps<Props>()

const cardTemplate = decksStore.getCardTemplateById(
  props.deckId,
  props.noteTypeId,
  props.cardTemplateId
)
</script>

<template>
  <MasterLayout>
    <template #title>{{
      cardTemplate == undefined ? 'Card template not found' : `Card template: ${cardTemplate.name}`
    }}</template>
    <template #content v-if="cardTemplate === undefined">
      <p>
        Card template with id {{ cardTemplateId }} for note type {{ noteTypeId }} in deck
        {{ deckId }} not found
      </p>
      <Button @click="$router.push({ name: 'decks' })">Home</Button>
    </template>
    <template #content v-else>
      <CardTemplateContent :card="cardTemplate" />
    </template>
  </MasterLayout>
</template>

<style scoped></style>
