<script setup lang="ts">
import { ref } from 'vue'
import { Button, PanelMenu } from 'primevue'

/*

Each variant has:

Variant name: flag or make default
  Templates
    CSS
    Front
    Back
  Widgets: add widget config
    widget name: delete widget config
    widget name: delete widget config
*/

const items = ref([
  {
    label: 'Files',
    icon: 'pi pi-file',
    contextMenu: {
      icon: 'pi pi-plus',
      command: () => {
        console.log('context menu click')
      },
    },
    items: [
      {
        label: 'Documents',
        icon: 'pi pi-file',
         contextMenu: {
      icon: 'pi pi-plus',
      command: () => {
        console.log('context menu click')
      },
    },
        items: [
          {
            label: 'Invoices',
            icon: 'pi pi-file-pdf',
            items: [
              {
                label: 'Pending',
                icon: 'pi pi-stop',
              },
              {
                label: 'Paid',
                icon: 'pi pi-check-circle',
              },
            ],
          },
          {
            label: 'Clients',
            icon: 'pi pi-users',
          },
        ],
      },
      {
        label: 'Images',
        icon: 'pi pi-image',
        items: [
          {
            label: 'Logos',
            icon: 'pi pi-image',
          },
        ],
      },
    ],
  },
])
</script>

<template>
  <PanelMenu :model="items" :pt="{ panel: 'border-none!' }">
    <template #item="{ item, active }">
      <a v-ripple class="flex gap-2 items-center px-3 py-2 cursor-pointer group h-10">
        <i
          class="pi text-(--p-panelmenu-submenu-icon-color)"
          :class="active ? 'pi-chevron-down' : 'pi-chevron-right'"
        ></i>
        <i v-if="item.icon" class="text-(--p-panelmenu-submenu-icon-color)" :class="item.icon"></i>
        <span class="truncate">{{ item.label }}</span>
        <Button
          v-if="item.contextMenu"
          :icon="item.contextMenu.icon"
          class="ml-auto"
          size="small"
          text
          rounded
          severity="secondary"
          @click.stop="item.contextMenu.command && item.contextMenu.command()"
        />
      </a>
    </template>
  </PanelMenu>
  <PanelMenu :model="items" />
</template>

<style scoped></style>
