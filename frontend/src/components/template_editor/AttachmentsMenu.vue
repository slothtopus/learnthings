<script setup lang="ts">
import { computed } from 'vue'
import { useFileDialog } from '@vueuse/core'
import type { CardTemplate, CardTemplateAttachment } from 'core/CardTemplate.js'

import { PanelMenu } from 'primevue'

import MenuSection from './menu/MenuSection.vue'
import ExtendedMenuItem from './menu/ExtendedMenuItem.vue'
import type { ExtendedMenuItem as ExtendedMenuItemType } from './menu/ExtendedMenuItem.vue'

interface Props {
  cardTemplate: CardTemplate
}
const props = defineProps<Props>()

const emit = defineEmits<{
  insert: [text: string]
}>()

const { open, reset, onChange } = useFileDialog({
  accept: '*/*',
  multiple: false,
})

onChange(async (fileList) => {
  if (fileList && fileList.length > 0) {
    const file = fileList[0]
    props.cardTemplate.createNewAttachment({
      filename: file.name,
      mimetype: file.type,
      data: file,
    })
    reset()
    await props.cardTemplate.deck.persist()
  }
})

const createAttachmentMenuItem = (attachment: CardTemplateAttachment) => ({
  id: attachment.id,
  icon: 'pi pi-clone',
  label: attachment.attachment.filename,
  menuControl: {
    type: 'menu',
    items: [
      {
        label: 'Delete',
        command: async () => {
          attachment.flagShouldDelete(true)
          await attachment.deck.persist()
        },
      },
      {
        label: 'Insert',
        command: async () => {
          emit('insert', `{{ '${attachment.getTemplateTag()}' }}`)
        },
      },
    ],
  },
})

const items = computed(() => props.cardTemplate.getAllAttachments().map(createAttachmentMenuItem))
</script>

<template>
  <MenuSection title="Attachment" icon="pi pi-plus" @clicked="open">
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
        <ExtendedMenuItem :item="item" :active="active" :has-submenu="hasSubmenu" />
      </template>
    </PanelMenu>
  </MenuSection>
</template>

<style scoped></style>
