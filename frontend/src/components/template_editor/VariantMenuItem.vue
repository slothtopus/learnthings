<script setup lang="ts">
import { useTemplateRef } from 'vue'

import { Badge, Button, Menu } from 'primevue'
import type { CardTemplateVariant } from 'core/CardTemplate.js'

interface Props {
  variant: CardTemplateVariant
  isSelected?: boolean
  isDefault?: boolean
}
defineProps<Props>()

const emit = defineEmits<{
  makeDefault: []
}>()

const contextMenu = useTemplateRef('contextMenu')
const contextMenuItems = [{ label: 'Make default', command: () => emit('makeDefault') }]
const toggleContextMenu = (event: Event) => {
  contextMenu.value?.toggle(event)
}
</script>

<template>
  <a
    :key="variant.id"
    class="flex items-center p-2 cursor-pointer group rounded-sm h-10"
    :class="{
      'bg-slate-800': isSelected,
    }"
  >
    <Badge :class="{ invisible: !variant.shouldPersist() }" class="mr-2" />
    <span class="pi pi-clone text-primary group-hover:text-inherit" />
    <span class="ml-2 truncate">{{ variant.name }}</span>
    <span v-if="isDefault" class="pi pi-flag-fill ml-auto mr-2"></span>
    <template v-else>
      <Button
        icon="pi pi-ellipsis-v"
        class="ml-auto"
        size="small"
        text
        severity="secondary"
        aria-haspopup="true"
        :aria-controls="`variant-${variant.id}-context-menu`"
        @click="toggleContextMenu"
      />
      <Menu
        ref="contextMenu"
        :id="`variant-${variant.id}-context-menu`"
        :model="contextMenuItems"
        :popup="true"
      />
    </template>
  </a>
</template>

<style scoped></style>
