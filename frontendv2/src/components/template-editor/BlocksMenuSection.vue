<script setup lang="ts">
import SidebarCollapsibleSection from '@/components/template-editor/SidebarCollapsibleSection.vue'
import SidebarCollapsibleMenuItem from './SidebarCollapsibleMenuItem.vue'
import type { ActiveObject } from '@/views/CardTemplateEditorView.vue'

import type { CardTemplateBlock } from 'core/CardTemplate.js'

interface Props {
  label: string
  blocks: CardTemplateBlock[]
}
defineProps<Props>()

defineEmits<{ new: []; delete: [block: CardTemplateBlock] }>()

const activeObject = defineModel<ActiveObject>('activeObject', { required: true })
</script>

<template>
  <SidebarCollapsibleSection
    icon="description"
    :label="label"
    action-icon="add"
    :collapsible="blocks.length > 0"
    :count="blocks.length"
    @action="$emit('new')"
  >
    <SidebarCollapsibleMenuItem
      v-for="block in blocks"
      :key="block.id"
      :active="activeObject.type === 'block' && activeObject.object === block"
      :dirty="block.shouldPersist()"
      icon="article"
      action-icon="delete"
      @click="activeObject = { type: 'block', object: block }"
      @action="$emit('delete', block)"
      >{{ block.name }}</SidebarCollapsibleMenuItem
    >
  </SidebarCollapsibleSection>
</template>

<style scoped></style>
