<script setup lang="ts">
import { computed } from 'vue'

import NewNamedObjectDialog from '@/components/used/NewNamedObjectDialog.vue'
import type {
  NewNamedObjectFormData,
  NewNamedObjectContext,
} from '@/components/used/NewNamedObjectDialog.vue'
import type { ActiveObject } from '@/views/CardTemplateEditorView.vue'
import BlocksMenuSection from './BlocksMenuSection.vue'

import { useFormDialog } from '@/composables/useFormDialog'
import { useConfirmation } from '@/composables/useConfirmationDialog'

import type { CardTemplate } from 'core/CardTemplate.js'
import type { CardTemplateBlock } from 'core/CardTemplate.js'

interface Props {
  cardTemplate: CardTemplate
}
const props = defineProps<Props>()

const activeObject = defineModel<ActiveObject>('activeObject', { required: true })

const cardTemplateScopedBlocks = computed(() => props.cardTemplate.getCardTemplateScopedBlocks())
const noteTypeScopedBlocks = computed(() => props.cardTemplate.getNoteTypeScopedBlocks())
const deckScopedBlocks = computed(() => props.cardTemplate.getDeckScopedBlocks())

const newNamedObjectDialog = useFormDialog<NewNamedObjectFormData, NewNamedObjectContext>(
  NewNamedObjectDialog,
)
const handleNewBlock = async (scope: 'template' | 'deck' | 'notetype') => {
  const result = await newNamedObjectDialog.open(
    { name: '' },
    { title: 'Create New Block', label: 'Card Template Block Name', placeholder: '' },
  )
  if (!result.cancelled) {
    const { name } = result.data
    const block = props.cardTemplate.createNewBlock(name, scope)
    activeObject.value = { type: 'block', object: block }
  }
  await props.cardTemplate.deck.persist()
}

const { showConfirmation } = useConfirmation()
const handleDeleteBlock = async (block: CardTemplateBlock) => {
  if (await showConfirmation('Delete Block', `Are you sure you want to delete "${block.name}"?`)) {
    block.flagShouldDelete(true)
    await block.deck.persist()
  }
}
</script>

<template>
  <div class="px-3 pt-4 pb-3">
    <div class="px-1 mb-2">
      <span class="text-[9px] font-bold tracking-widest uppercase text-on-surface-variant/50"
        >Blocks</span
      >
    </div>
    <BlocksMenuSection
      label="Card template scoped"
      v-model:active-object="activeObject"
      :blocks="cardTemplateScopedBlocks"
      @new="handleNewBlock('template')"
      @delete="handleDeleteBlock"
    />
    <BlocksMenuSection
      label="Note type scoped"
      v-model:active-object="activeObject"
      :blocks="noteTypeScopedBlocks"
      @new="handleNewBlock('notetype')"
      @delete="handleDeleteBlock"
    />
    <BlocksMenuSection
      label="Deck scoped"
      v-model:active-object="activeObject"
      :blocks="deckScopedBlocks"
      @new="handleNewBlock('deck')"
      @delete="handleDeleteBlock"
    />
  </div>
</template>

<style scoped></style>
