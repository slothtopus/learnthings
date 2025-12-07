<script setup lang="ts">
import { ref, computed, watch } from 'vue'

import { SelectButton, Select, FloatLabel } from 'primevue'

import { useNoteTypeDetails } from '@/composables/useObjectDetails'

import AspectPreview from '@/components/renderer/AspectPreview.vue'
import CardRenderer from '@/components/renderer/CardRenderer.vue'
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

const selectedVariantId = ref(props.template.getDefaultVariant().id)
const variantOptions = computed(() =>
  props.template.getAllVariants().map((v) => ({ id: v.id, name: v.name })),
)
const selectedVariant = computed(
  () => props.template.getAllVariants().find((v) => v.id === selectedVariantId.value)!,
)

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
    <div class="flex gap-4 justify-center items-center flex-wrap">
      <SelectButton v-model="displayedSide" :options="sideOptions" />
      <FloatLabel class="w-42" variant="on">
        <Select
          class="w-full"
          inputId="template-select"
          v-model="selectedVariantId"
          :options="variantOptions"
          optionLabel="name"
          optionValue="id"
          size="small"
        />
        <label for="template-select">Variant</label>
      </FloatLabel>
    </div>
    <AspectPreview
      class="w-full"
      :card="renderedCards[displayedSide == 'Front' ? 0 : 1]"
      :previewWidth="1280"
      :previewHeight="720"
      v-slot="{ scaleStyle }"
    >
      <CardRenderer
        class="content bg-black"
        :card="renderedCards[displayedSide == 'Front' ? 0 : 1]"
        :widgetSettings="selectedVariant.getWidgetSettingsContext()"
        :style="scaleStyle"
      />
    </AspectPreview>
  </div>
</template>

<style scoped>
.content {
  transform-origin: top left;
}
</style>
