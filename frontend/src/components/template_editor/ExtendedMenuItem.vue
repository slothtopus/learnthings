<script setup lang="ts">
import type { MenuItem } from 'primevue/menuitem'

import MenuItemControl from './MenuItemControl.vue'
import type { MenuControl } from './MenuItemControl.vue'

export type ExtendedMenuItem = MenuItem & {
  menuControl?: MenuControl
}

interface Props {
  item: ExtendedMenuItem
  hasSubmenu?: boolean
  selected?: boolean
  active?: boolean
}
defineProps<Props>()
</script>

<template>
  <a
    class="flex gap-2 items-center px-3 py-2 cursor-pointer group h-10 rounded-sm mb-1"
    :class="{ 'bg-slate-800': selected }"
  >
    <i
      v-if="hasSubmenu"
      class="pi text-(--p-panelmenu-submenu-icon-color)"
      :class="active ? 'pi-chevron-down' : 'pi-chevron-right'"
    ></i>
    <i v-if="item.icon" class="text-(--p-panelmenu-submenu-icon-color)" :class="item.icon"></i>
    <span class="truncate">{{ item.label }}</span>
    <MenuItemControl v-if="item.menuControl" :id="item.id" :control="item.menuControl" />
  </a>
</template>

<style scoped></style>
