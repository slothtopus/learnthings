<script setup lang="ts">
import { computed } from 'vue'

import { Button } from 'primevue'

import BlockMenuItem from './BlockMenuItem.vue'
import CreateNewBlockForm from './CreateNewBlockForm.vue'
import type { FormData } from './CreateNewBlockForm.vue'
import { useFormDialog } from '@/composables/useFormDialog'

import type { CardTemplate } from 'core/CardTemplate.js'
import { PersistableObject } from 'core/PersistableObject.js'

interface Props {
  cardTemplate: CardTemplate
}
const props = defineProps<Props>()

const deckScopedBlocks = computed(() => props.cardTemplate.getDeckScopedBlocks())
const noteTypeScopedBlocks = computed(() => props.cardTemplate.getNoteTypeScopedBlocks())
const templateScopedBlocks = computed(() => props.cardTemplate.getCardTemplateScopedBlocks())

const selected = defineModel<PersistableObject<any> | undefined>()
const { openDialog: openBlockDialog } = useFormDialog<FormData>(
  CreateNewBlockForm,
  'Create new block',
)
const handleCreateNewBlock = async () => {
  const result = await openBlockDialog()
  if (!result.cancelled) {
    const { name, scope } = result.data
    console.log(name, scope)
    props.cardTemplate.createNewBlock(name, scope)
  }
}
</script>

<template>
  <div>
    <div class="flex gap-2 items-center px-2 mb-2 border-b-1 border-gray-700">
      <h2 class="w-full truncate">Blocks</h2>
      <Button text icon="flex-0 pi pi-plus" @click="handleCreateNewBlock" />
    </div>
    <template v-if="deckScopedBlocks.length > 0">
      <h3 class="h-10 py-2 px-3 text-gray-400 font-bold truncate">Deck scoped</h3>
      <BlockMenuItem
        v-for="block in deckScopedBlocks"
        :key="block.id"
        :block="block"
        :is-selected="selected?.id === block.id"
        @click="selected = block"
      />
    </template>
    <template v-if="noteTypeScopedBlocks.length > 0">
      <h3 class="h-10 py-2 px-3 text-gray-400 font-bold truncate">Note type scoped</h3>
      <BlockMenuItem
        v-for="block in noteTypeScopedBlocks"
        :key="block.id"
        :block="block"
        :is-selected="selected?.id === block.id"
        @click="selected = block"
      />
    </template>
    <template v-if="templateScopedBlocks.length > 0">
      <h3 class="h-10 py-2 px-3 text-gray-400 font-bold truncate">Card template scoped</h3>
      <BlockMenuItem
        v-for="block in templateScopedBlocks"
        :key="block.id"
        :block="block"
        :is-selected="selected?.id === block.id"
        @click="selected = block"
      />
    </template>
  </div>
</template>

<style scoped></style>
