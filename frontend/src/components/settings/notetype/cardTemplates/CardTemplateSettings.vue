<script setup lang="ts">
import { computed } from 'vue'
import { Button } from 'primevue'
import CardTemplateComponent from './CardTemplate.vue'
import CreateCardTemplateForm from './CreateCardTemplateForm.vue'
import type { FormData } from './CreateCardTemplateForm.vue'

import { useFormDialog } from '@/composables/useFormDialog'
import type { NoteType } from 'core/NoteType.js'

import { CardTemplate } from 'core/CardTemplate.js'

interface Props {
  noteType: NoteType
}
const props = defineProps<Props>()

const cardTemplatesNew = computed(
  () =>
    props.noteType.objectManager.query({
      include: { doctype: CardTemplate.doctype },
    }) as CardTemplate[],
)

const { openDialog } = useFormDialog<FormData>(CreateCardTemplateForm, 'Create new card template')

const handleCreateNew = async () => {
  const result = await openDialog()
  if (!result.cancelled) {
    const template = CardTemplate.createNewEmpty(props.noteType.objectManager, {
      name: result.data.name,
      noteTypeId: props.noteType.id,
    })
    template.objectManager.setObject(template)
    props.noteType.deck.persist()
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 mt-4">
    <CardTemplateComponent
      v-for="template in cardTemplatesNew"
      :key="template.id"
      :cardTemplate="template"
    />
    <div class="flex w-full items-center">
      <Button
        text
        icon="pi pi-plus"
        label="New card template"
        size="small"
        @click="handleCreateNew"
      />
    </div>
  </div>
</template>

<style scoped></style>
