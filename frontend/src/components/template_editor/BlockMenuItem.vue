<script setup lang="ts">
import { Badge } from 'primevue'
import type { CardTemplateBlock } from 'core/CardTemplate.js'

interface Props {
  block: CardTemplateBlock
  isSelected?: boolean
}
defineProps<Props>()
</script>

<template>
  <a
    :key="block.id"
    class="flex items-center p-2 cursor-pointer group rounded-sm h-10"
    :class="{
      'bg-slate-800': isSelected,
    }"
  >
    <Badge :class="{ invisible: !block.shouldPersist() }" class="mr-2" />
    <span class="pi pi-clone text-primary group-hover:text-inherit" />
    <span class="ml-2 truncate">{{ block.name }}</span>
  </a>
</template>

<style scoped></style>
