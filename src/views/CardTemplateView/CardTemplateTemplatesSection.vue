<script setup lang="ts">
import { ref, computed } from 'vue'

import SectionLayout from '@/views/layouts/SectionLayout.vue'

import SelectControl from '@/components/ui/SelectControl.vue'
import CardTemplatePreview from './CardTemplatePreview.vue'
import CodeMirrorEditor from '@/components/CodeMirrorEditor.vue'

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
  <SectionLayout class="h-full min-h-[32rem] overflow-hidden">
    <template #title>Templates</template>
    <template #content>
      <div class="grid-section">
        <div class="flex flex-col gap-3 overflow-hidden p-2">
          <SelectControl :options="TEMPLATES" v-model="selectedTemplate" />
          <CodeMirrorEditor
            v-if="selectedTemplate.id == 'front'"
            v-model="frontTemplate"
            mode="html"
          />
          <CodeMirrorEditor
            v-else-if="selectedTemplate.id == 'back'"
            r
            v-model="backTemplate"
            mode="html"
          />
          <CodeMirrorEditor
            v-else-if="selectedTemplate.id == 'css'"
            v-model="cssTemplate"
            mode="css"
          />
        </div>
        <CardTemplatePreview :card="card" :noteType="noteType" />
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
  height: 100%;
}
</style>
