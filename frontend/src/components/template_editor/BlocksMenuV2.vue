<script setup lang="ts">
import { computed } from 'vue'

import { PanelMenu } from 'primevue'

import type { CardTemplate, CardTemplateBlock } from 'core/CardTemplate.js'

import MenuSection from './MenuSection.vue'
import ExtendedMenuItem from './ExtendedMenuItem.vue'
import type { ExtendedMenuItem as ExtendedMenuItemType } from './ExtendedMenuItem.vue'
import type { EditableObject } from '@/views/CardTemplateEditorView.vue'
import CreateNewNamedObjectForm from '@/components/forms/CreateNewNamedObjectForm.vue'
import type { FormData } from './CreateNewBlockForm.vue'
import { useFormDialog } from '@/composables/useFormDialog'

interface Props {
  cardTemplate: CardTemplate
}
const props = defineProps<Props>()

const deckScopedBlocks = computed(() => props.cardTemplate.getDeckScopedBlocks())
const noteTypeScopedBlocks = computed(() => props.cardTemplate.getNoteTypeScopedBlocks())
const templateScopedBlocks = computed(() => props.cardTemplate.getCardTemplateScopedBlocks())

const selectedObject = defineModel<EditableObject>()
const { openDialog: openBlockDialog } = useFormDialog<FormData>(
  CreateNewNamedObjectForm,
  'Create new block',
)

const handleCreateNewBlock = async (scope: 'template' | 'deck' | 'notetype') => {
  const result = await openBlockDialog()
  if (!result.cancelled) {
    const { name } = result.data
    console.log(name, scope)
    props.cardTemplate.createNewBlock(name, scope)
    await props.cardTemplate.deck.persist()
  }
}

const mapBlocksToMenuItems = (blocks: CardTemplateBlock[]): ExtendedMenuItemType[] =>
  blocks.map((b) => ({
    id: b.id,
    icon: 'pi pi-clone',
    label: b.name,
    command: () => {
      selectedObject.value = { obj: b, template: undefined }
    },
    menuControl: {
      type: 'button',
      icon: 'pi pi-trash',
      command: async () => {
        b.flagShouldDelete(true)
        await props.cardTemplate.deck.persist()
        if (selectedObject.value?.obj.id === b.id) {
          selectedObject.value = undefined
        }
      },
    },
  }))

const items = computed(() => [
  {
    icon: 'pi pi-clone',
    label: 'Card template scoped',
    items: mapBlocksToMenuItems(templateScopedBlocks.value),
    menuControl: {
      type: 'button',
      icon: 'pi pi-plus',
      command: () => handleCreateNewBlock('template'),
    },
  },
  {
    icon: 'pi pi-clone',
    label: 'Note type scoped',
    items: mapBlocksToMenuItems(noteTypeScopedBlocks.value),
    menuControl: {
      type: 'button',
      icon: 'pi pi-plus',
      command: () => handleCreateNewBlock('notetype'),
    },
  },
  {
    icon: 'pi pi-clone',
    label: 'Deck scoped',
    items: mapBlocksToMenuItems(deckScopedBlocks.value),
    menuControl: {
      type: 'button',
      icon: 'pi pi-plus',
      command: () => handleCreateNewBlock('deck'),
    },
  },
])
</script>

<template>
  <MenuSection title="Blocks">
    <PanelMenu :model="items" :pt="{ panel: 'border-none!', root: 'gap-0!' }">
      <template
        #item="{
          item,
          active,
          hasSubmenu,
        }: {
          item: ExtendedMenuItemType
          active: boolean
          hasSubmenu: boolean
        }"
      >
        <ExtendedMenuItem
          :item="item"
          :active="active"
          :has-submenu="hasSubmenu"
          :selected="selectedObject?.obj.id === item.id"
        />
      </template>
    </PanelMenu>
  </MenuSection>
</template>

<style scoped></style>
