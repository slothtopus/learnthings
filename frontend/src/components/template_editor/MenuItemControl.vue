<script setup lang="ts">
import { useTemplateRef } from 'vue'

import { Button, Menu } from 'primevue'
import type { MenuItem } from 'primevue/menuitem'
import {nanoid} from 'nanoid'

export type MenuControl =
  | { type: 'icon'; icon: string }
  | { type: 'button'; icon: string; command: () => void }
  | { type: 'menu'; items: MenuItem[] }

interface Props {
  id?: string
  control: MenuControl
}

const props = defineProps<Props>()
const _id = props.id ?? nanoid(5)

const contextMenu = useTemplateRef('contextMenu')
const toggleContextMenu = (event: Event) => {
  contextMenu.value?.toggle(event)
}
</script>

<template>
  <div class="ml-auto">
    <template v-if="control.type === 'icon'">
      <i :class="control.icon" class="mr-2"></i>
    </template>
    <Button
      v-else-if="control.type === 'button'"
      :icon="control.icon"
      size="small"
      text
      rounded
      severity="secondary"
      @click.stop="control.command()"
    />
    <template v-else-if="control.type === 'menu'">
      <Button
        icon="pi pi-ellipsis-v"
        size="small"
        text
        severity="secondary"
        aria-haspopup="true"
        :aria-controls="`variant-${_id}-context-menu`"
        @click.stop="toggleContextMenu($event)"
      />
      <Menu
        ref="contextMenu"
        :id="`variant-${_id}-context-menu`"
        :model="control.items"
        :popup="true"
      />
    </template>
  </div>
</template>

<style scoped></style>
