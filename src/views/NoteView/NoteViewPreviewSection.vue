<script setup lang="ts">
import { ref } from 'vue'

import SelectControl from '@/components/ui/SelectControl.vue'
import AspectPreview from '@/components/AspectPreview.vue'

import type { SelectOption } from '@/components/ui/ui.types'

type SelectOptionWithDims = SelectOption & { dims: number[] }
const options: SelectOptionWithDims[] = [
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

const selectedOption = ref<SelectOptionWithDims>(options[0])
</script>

<template>
  <div class="flex flex-col gap-4 h-full w-full p-2">
    <SelectControl :options="options" v-model="selectedOption" />
    <AspectPreview :previewWidth="selectedOption.dims[0]" :previewHeight="selectedOption.dims[1]"
      ><h1>HELLO</h1>
      <pre>{{ selectedOption }}</pre>
    </AspectPreview>
  </div>
</template>

<style scoped>
h1 {
  font-size: 6rem;
}
</style>
