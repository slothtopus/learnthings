<script setup lang="ts">
import { computed } from 'vue'

import CardRow from '@/components/CardRow.vue'
import SelectControl from '@/components/ui/SelectControl.vue'

import { useCardDimensions } from '@/composables/useCardDimensions'

import type { Note } from '@/lib/Note'
import type { NoteType } from '@/lib/NoteType'

interface Props {
  note: Note
  noteType: NoteType
}
const props = defineProps<Props>()

const populatedFields = computed(() => {
  return props.note.populateFields(props.noteType.fields, false)
})

const previewCards = computed(() => {
  return props.noteType.cards.map((c) => ({
    id: c.id,
    name: c.name,
    front: c.render('front', populatedFields.value),
    back: c.render('back', populatedFields.value)
  }))
})

const { DIMENSION_OPTIONS, selectedDimensionOption } = useCardDimensions()
</script>

<template>
  <SelectControl class="mx-auto" :options="DIMENSION_OPTIONS" v-model="selectedDimensionOption" />
  <div class="overflow-auto h-full -mr-4 -ml-2 py-2 pr-6 pl-2">
    <CardRow
      v-for="{ id, name, front, back } in previewCards"
      :key="id"
      :name="name"
      :renderedFront="front"
      :renderedBack="back"
      :dims="selectedDimensionOption.dims"
    />
  </div>
</template>

<style scoped></style>
