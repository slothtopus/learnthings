<script setup lang="ts">
import { computed } from 'vue'
import type { CardTemplate, CardTemplateVariant } from 'core/CardTemplate.js'
import type { EditableObject } from '@/views/CardTemplateEditorView.vue'

import MenuSection from './menu/MenuSection.vue'
import ExtendedMenuItem from './menu/ExtendedMenuItem.vue'
import type { ExtendedMenuItem as ExtendedMenuItemType } from './menu/ExtendedMenuItem.vue'
import CreateNewNamedObjectForm from '@/components/forms/CreateNewNamedObjectForm.vue'
import type { FormData } from '@/components/forms/CreateNewNamedObjectForm.vue'
import { useFormDialog } from '@/composables/useFormDialog'
import { useWidgetSettingsMenu } from '@/components/renderer/widgets/src/useWidgets'

import { PanelMenu } from 'primevue'
import type { MenuItem as MenuItemType } from 'primevue/menuitem'

interface Props {
  cardTemplate: CardTemplate
}
const props = defineProps<Props>()

const selectedObject = defineModel<EditableObject>()

const isItemSelected = (item: MenuItemType) =>
  selectedObject.value &&
  item.id === `${selectedObject.value.obj.id}${selectedObject.value.template ?? ''}`

const createVariantMenuItem = (variant: CardTemplateVariant) => {
  return {
    id: variant.id,
    icon: variant.isDefault() ? 'pi pi-flag-fill' : 'pi pi-flag',
    label: variant.name,
    items: [
      {
        id: variant.id + 'css',
        icon: 'pi pi-clone',
        label: 'CSS',
        command: () => {
          selectedObject.value = { obj: variant, template: 'css' }
        },
      },
      {
        id: variant.id + 'front',
        icon: 'pi pi-clone',
        label: 'Front',
        command: () => {
          selectedObject.value = { obj: variant, template: 'front' }
        },
      },
      {
        id: variant.id + 'back',
        icon: 'pi pi-clone',
        label: 'Back',
        command: () => {
          selectedObject.value = { obj: variant, template: 'back' }
        },
      },
    ],
    menuControl: createVariantContextMenu(variant),
  } as ExtendedMenuItemType
}

const { generateWidgetSettingsMenu } = useWidgetSettingsMenu()

const createVariantContextMenu = (variant: CardTemplateVariant) => ({
  type: 'menu',
  items: [
    ...(variant.isDefault()
      ? []
      : [
          {
            label: 'Make default',
            command: async () => {
              console.log('make default', variant.id)
              props.cardTemplate.setDefaultVariantId(variant.id)
              await props.cardTemplate.deck.persist()
            },
          },
        ]),
    {
      label: 'Delete',
      command: async () => {
        variant.flagShouldDelete(true)
        await props.cardTemplate.deck.persist()
        if (selectedObject.value?.obj.id === variant.id) {
          selectedObject.value = undefined
        }
      },
    },
    {
      label: 'Widget Settings',
      items: generateWidgetSettingsMenu(variant),
    },
  ],
})

const items = computed<ExtendedMenuItemType[]>(() =>
  props.cardTemplate.getAllVariants().map(createVariantMenuItem),
)

const { openDialog: openVariantDialog } = useFormDialog<FormData>(
  CreateNewNamedObjectForm,
  'Create new variant',
)

const handleCreateNewVariant = async () => {
  const result = await openVariantDialog()
  if (result.cancelled) return
  const { name } = result.data
  props.cardTemplate.createNewVariant(name)
  await props.cardTemplate.deck.persist()
}
</script>

<template>
  <MenuSection title="Variants" icon="pi pi-plus" @clicked="handleCreateNewVariant">
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
          :selected="isItemSelected(item)"
        />
      </template>
    </PanelMenu>
  </MenuSection>
</template>

<style scoped></style>
