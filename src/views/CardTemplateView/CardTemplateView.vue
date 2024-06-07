<script setup lang="ts">
import { ref, onMounted } from 'vue'

import MasterLayout from '@/views/layouts/MasterLayout.vue'
import CardTemplateContent from './CardTemplateContent.vue'

import { CardTemplate } from '@/lib/CardTemplate'

import { useDecksStore } from '@/stores/decks'
const decksStore = useDecksStore()

interface Props {
  deckId: string
  noteTypeIndex: string
  cardTemplateIndex: string
}
const props = defineProps<Props>()

const cardTemplate = ref<CardTemplate | undefined>(undefined)
onMounted(async () => {
  cardTemplate.value = await decksStore.getCardTemplateByIndex(
    Number(props.deckId),
    Number(props.noteTypeIndex),
    Number(props.cardTemplateIndex)
  )
})

/*const noteType = ref(new AsyncLoader<NoteType>(props.noteTypeId, NoteType))
const cardTemplate = computed(() =>
  noteType.value.data?.cards.find((card) => card.id == props.cardTemplateId)
)
const isError = computed(
  () => noteType.value.isError || (noteType.value.data && cardTemplate.value === undefined)
)*/
</script>

<template>
  <MasterLayout :loading="decksStore.loading">
    <template #title>{{
      cardTemplate == undefined ? 'Card template not found' : `Card template: ${cardTemplate.name}`
    }}</template>
    <template #content v-if="cardTemplate === undefined">
      <p>Card template with index {{ cardTemplateIndex }} not found.</p>
    </template>
    <template #content v-else>
      <CardTemplateContent :card="cardTemplate" />
    </template>
  </MasterLayout>
</template>

<style scoped></style>
