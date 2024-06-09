<script setup lang="ts">
import { ref, computed } from 'vue'

import SectionLayout from '@/views/layouts/SectionLayout.vue'

import SelectControl from '@/components/ui/SelectControl.vue'
import { Textarea } from '@/components/shadcn-ui/textarea'
import CardPreview from '@/components/CardPreview.vue'

import type { CardTemplate } from '@/lib/CardTemplate'
import type { NoteType } from '@/lib/NoteType'
import type { SelectOption } from '@/components/ui/ui.types'

interface Props {
  card: CardTemplate
  noteType: NoteType
}
const props = defineProps<Props>()

const TEMPLATES: SelectOption[] = [
  { id: 'front', value: 'Front template' },
  { id: 'back', value: 'Back template' },
  { id: 'css', value: 'CSS' }
]
const selectedTemplate = ref(TEMPLATES[0])

const frontTemplate = computed({
  get: () => props.card.frontTemplate,
  set: (template: string) => props.card.setFrontTemplate(template)
})

const backTemplate = computed({
  get: () => props.card.backTemplate,
  set: (template: string) => props.card.setBackTemplate(template)
})

const cssTemplate = computed({
  get: () => props.card.css,
  set: (template: string) => props.card.setCSSTemplate(template)
})
</script>

<template>
  <SectionLayout>
    <template #title>Templates</template>
    <template #content>
      <div class="grid-section">
        <div class="flex flex-col gap-3">
          <SelectControl :options="TEMPLATES" v-model="selectedTemplate" />
          <Textarea v-if="selectedTemplate.id == 'front'" rows="20" v-model="frontTemplate" />
          <Textarea v-else-if="selectedTemplate.id == 'back'" rows="20" v-model="backTemplate" />
          <Textarea v-else rows="20" v-model="cssTemplate" />
        </div>
        <CardPreview class="p-0 items-center" :template="card" :noteFields="noteType.fields" />
      </div>
    </template>
  </SectionLayout>
</template>

<style scoped>
.grid-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto;
  gap: 0 1rem;
}
</style>
