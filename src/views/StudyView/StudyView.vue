<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

import StudyViewContent from '@/views/StudyView/StudyViewContent.vue'

import { useRouter } from 'vue-router'
import { useDecksStore } from '@/stores/decks'

import type { Scheduler, Card } from '@/lib/Scheduler'

interface Props {
  deckId: string
  cardId?: string
}
const props = defineProps<Props>()

const router = useRouter()
const decksStore = useDecksStore()

const card = ref<Card | undefined>(undefined)
const scheduler = ref<Scheduler | undefined>(undefined)

const initialise = async () => {
  const deck = await decksStore.getDeck(Number(props.deckId))
  await deck.scheduler.initialiseIfNeeded()

  if (props.cardId === undefined || props.cardId == '') {
    router.push({
      name: 'study',
      params: deck.scheduler.getNextCardIds()
    })
  } else {
    card.value = deck.scheduler.getCardOrThrow(props.cardId)
    scheduler.value = deck.scheduler
  }
}

onMounted(initialise)
watch([() => props.deckId, () => props.cardId], initialise)
</script>

<template>
  <StudyViewContent
    v-if="card !== undefined && scheduler !== undefined"
    :key="props.cardId"
    :scheduler="scheduler"
    :card="card"
  />
</template>

<style scoped></style>
