<script setup lang="ts">
import { ref, computed, watch } from 'vue'

import { SelectButton } from 'primevue'

import { useNoteTypeDetails } from '@/composables/useObjectDetails'

import AspectPreview from '@/components/renderer/AspectPreview.vue'
import type { CardTemplate, RenderedContent } from 'core/CardTemplate.js'

interface Props {
  template: CardTemplate
}
const props = defineProps<Props>()

const { notes } = useNoteTypeDetails(() => props.template.noteType)
const exampleNote = ref(notes.value[0])

const renderedContent = ref<RenderedContent | undefined>()
watch(
  exampleNote,
  async () => {
    if (exampleNote.value) {
      const fieldContent = await props.template.renderAllFieldContent(exampleNote.value)
      renderedContent.value = Object.assign(fieldContent, exampleNote.value.getInternalContext())
    }
  },
  { immediate: true },
)

const selectedVariant = computed(() => props.template.getAllVariants()[0])

const renderedCards = computed(() => {
  return [
    props.template.renderCard(
      selectedVariant.value.front,
      selectedVariant.value.css,
      renderedContent.value ?? {},
    ),
    props.template.renderCard(
      selectedVariant.value.back,
      selectedVariant.value.css,
      renderedContent.value ?? {},
    ),
  ]
})

const sideOptions = ['Front', 'Back']
const displayedSide = ref(sideOptions[0])
</script>

<template>
  <div class="w-full h-full p-4 flex flex-col items-center">
    <SelectButton v-model="displayedSide" :options="sideOptions" />
    <AspectPreview
      class="w-full"
      :card="renderedCards[displayedSide == 'Front' ? 0 : 1]"
      :previewWidth="1280"
      :previewHeight="720"
    />
  </div>
</template>

<style scoped></style>
