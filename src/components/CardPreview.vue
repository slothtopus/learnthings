<script setup lang="ts">
import { ref, computed } from 'vue'

import SelectControl from '@/components/ui/SelectControl.vue'
import AspectPreview from '@/components/AspectPreview.vue'

import type { SelectOption } from '@/components/ui/ui.types'
import type { RenderedCard } from '@/lib/CardTemplate'

interface Props {
  renderedCard: RenderedCard
}
const props = defineProps<Props>()

type SelectOptionWithDims = SelectOption & { dims: number[] }
const DIM_OPTIONS: SelectOptionWithDims[] = [
  {
    id: 'desktop',
    value: 'Desktop 1280x1024',
    dims: [1280, 1024]
  },
  {
    id: 'tablet',
    value: 'Tablet 1024x768',
    dims: [1024, 768]
  },
  {
    id: 'mobile-l',
    value: 'Mobile 360x800',
    dims: [360, 800]
  },
  {
    id: 'mobile-p',
    value: 'Mobile 800x360',
    dims: [800, 360]
  }
]
const selectedDimOption = ref(DIM_OPTIONS[0])

const SIDE_OPTIONS: (SelectOption & { id: 'front' | 'back' })[] = [
  { id: 'front', value: 'Front' },
  { id: 'back', value: 'Back' }
]
const selectedSideOption = ref(SIDE_OPTIONS[0])

const renderedCard = computed(() => {
  return props.template.render(selectedSideOption.value.id, props.note.populateFields(props.fields))
})
</script>

<template>
  <div class="flex flex-col gap-4 h-full w-full p-2 items-center">
    <div class="flex gap-3 justify-center flex-wrap">
      <SelectControl :options="DIM_OPTIONS" v-model="selectedDimOption" />
      <SelectControl class="w-24" :options="SIDE_OPTIONS" v-model="selectedSideOption" />
    </div>
    <AspectPreview
      class="self-stretch"
      :previewWidth="selectedDimOption.dims[0]"
      :previewHeight="selectedDimOption.dims[1]"
      :html="renderedCard.html"
      :css="renderedCard.css"
    />
  </div>
</template>

<style scoped></style>
