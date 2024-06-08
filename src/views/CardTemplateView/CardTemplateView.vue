<script setup lang="ts">
import { ref, onMounted } from 'vue'

import MasterLayout from '@/views/layouts/MasterLayout.vue'
import CardTemplateContent from './CardTemplateContent.vue'

import { CardTemplate } from '@/lib/CardTemplate'

import { useDecksStore } from '@/stores/decks'
import { NoteType } from '@/lib/NoteType'
const decksStore = useDecksStore()

interface Props {
  deckId: string
  noteTypeId: string
  cardTemplateId: string
}
const props = defineProps<Props>()

const noteType = ref<NoteType | undefined>(undefined)
const cardTemplate = ref<CardTemplate | undefined>(undefined)
onMounted(async () => {
  noteType.value = await decksStore.getNoteTypeById(Number(props.deckId), Number(props.noteTypeId))
  cardTemplate.value = noteType.value?.getCardTemplateById(Number(props.cardTemplateId))

  /*await decksStore.getCardTemplateById(
    Number(props.deckId),
    Number(props.noteTypeId),
    Number(props.cardTemplateId)
  )*/
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
    <template #content v-if="cardTemplate === undefined || noteType === undefined">
      <p>
        Card template with id {{ cardTemplateId }} or note type with id {{ noteTypeId }} not found.
      </p>
    </template>
    <template #content v-else>
      <CardTemplateContent :card="cardTemplate" :noteType="noteType" />
    </template>
  </MasterLayout>
</template>

<style scoped></style>
