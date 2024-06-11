<script setup lang="ts">
import { ref, computed } from 'vue'

import AspectPreview from '@/components/AspectPreview.vue'
import SelectControl from '@/components/ui/SelectControl.vue'

import type { CardTemplate } from '@/lib/CardTemplate'
import { Note } from '@/lib/Note'
import type { NoteType } from '@/lib/NoteType'
import type { SelectOption } from '@/components/ui/ui.types'

import { useCardDimensions } from '@/composables/useCardDimensions'

interface Props {
  noteType: NoteType
  card: CardTemplate
}
const props = defineProps<Props>()

const { DIMENSION_OPTIONS, selectedDimensionOption } = useCardDimensions()

const SIDE_OPTIONS: (SelectOption & { id: 'front' | 'back' })[] = [
  { id: 'front', value: 'Front' },
  { id: 'back', value: 'Back' }
]
const selectedSideOption = ref(SIDE_OPTIONS[0])

const renderedCard = computed(() => {
  return props.card.render(
    selectedSideOption.value.id,
    Note.createPlaceholderNote(props.noteType).populateFields(props.noteType.fields)
  )
})
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex gap-3 justify-center">
      <SelectControl
        class="w-[12rem]"
        :options="DIMENSION_OPTIONS"
        v-model="selectedDimensionOption"
      />
      <SelectControl class="w-[6rem]" :options="SIDE_OPTIONS" v-model="selectedSideOption" />
    </div>
    <AspectPreview
      :html="renderedCard.html"
      :css="renderedCard.css"
      :previewWidth="selectedDimensionOption.dims[0]"
      :previewHeight="selectedDimensionOption.dims[1]"
    />
  </div>
</template>

<style scoped></style>
