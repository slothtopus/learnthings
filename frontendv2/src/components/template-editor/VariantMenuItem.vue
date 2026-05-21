<script setup lang="ts">
import { ref, computed } from 'vue'

import SidebarCollapsibleSection from '@/components/template-editor/SidebarCollapsibleSection.vue'
import SidebarCollapsibleMenuItem from './SidebarCollapsibleMenuItem.vue'
import AppIconButton from '@/components/used/AppIconButton.vue'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

import type { ActiveObject } from '@/views/CardTemplateEditorView.vue'
import type { CardTemplateVariant } from 'core/CardTemplate.js'
import { useConfirmation } from '@/composables/useConfirmationDialog'
import { useWidgetSettingsMenu } from '@/components/renderer/widgets/useWidgets'

interface Props {
  variant: CardTemplateVariant
}
const props = defineProps<Props>()

const variantMenuOpen = ref(false)
const activeObject = defineModel<ActiveObject>('activeObject', { required: true })

const { showConfirmation } = useConfirmation()
const { generateWidgetSettingsMenu } = useWidgetSettingsMenu()
const widgetSettingsMenu = computed(() => generateWidgetSettingsMenu(props.variant))

const handleSetDefault = async () => {
  props.variant.cardTemplate.setDefaultVariantId(props.variant.id)
  await props.variant.cardTemplate.deck.persist()
}

const handleDelete = async () => {
  const confirmed = await showConfirmation(
    `Delete variant "${props.variant.name}"?`,
    'This cannot be undone.',
  )
  if (!confirmed) return
  props.variant.flagShouldDelete(true)
  await props.variant.cardTemplate.deck.persist()
}
</script>

<template>
  <SidebarCollapsibleSection icon="style" :label="variant.name" :active="variantMenuOpen" :dirty="variant.shouldPersist()" :is-default="variant.isDefault()">
    <template #action>
      <DropdownMenu v-model:open="variantMenuOpen">
        <DropdownMenuTrigger as-child>
          <AppIconButton
            icon="more_horiz"
            size="sm"
            class="transition-opacity"
            :class="
              variantMenuOpen ? 'opacity-100 text-primary' : 'opacity-0 group-hover:opacity-100'
            "
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Widget settings</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                v-for="item in widgetSettingsMenu"
                :key="item.name"
                @click="item.open()"
              >
                {{ item.name }}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem v-if="!variant.isDefault()" @click="handleSetDefault">
            Set as default
          </DropdownMenuItem>
          <DropdownMenuItem class="text-error" @click="handleDelete">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </template>
    <SidebarCollapsibleMenuItem
      v-for="template in ['front', 'back', 'css'] as const"
      :key="template"
      :active="
        activeObject.type === 'variant' &&
        activeObject.object === variant &&
        activeObject.template === template
      "
      :icon="template === 'css' ? 'palette' : 'article'"
      @click="activeObject = { type: 'variant', object: variant, template }"
      >{{ template }}</SidebarCollapsibleMenuItem
    >
  </SidebarCollapsibleSection>
</template>

<style scoped></style>
