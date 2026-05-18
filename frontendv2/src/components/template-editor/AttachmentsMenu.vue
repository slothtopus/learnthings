<script setup lang="ts">
import { computed } from 'vue'
import { useFileDialog } from '@vueuse/core'

import SidebarCollapsibleSection from '@/components/template-editor/SidebarCollapsibleSection.vue'
import SidebarCollapsibleMenuItem from '@/components/template-editor/SidebarCollapsibleMenuItem.vue'
import { useConfirmation } from '@/composables/useConfirmationDialog'

import type { CardTemplate, CardTemplateAttachment } from 'core/CardTemplate.js'

interface Props {
  cardTemplate: CardTemplate
}
const props = defineProps<Props>()

const emit = defineEmits<{ insert: [text: string] }>()

const attachments = computed(() => props.cardTemplate.getAllAttachments())

const { open, reset, onChange } = useFileDialog({ accept: '*/*', multiple: false })

onChange(async (fileList) => {
  if (!fileList || fileList.length === 0) return
  const file = fileList[0]
  props.cardTemplate.createNewAttachment({
    filename: file.name,
    mimetype: file.type,
    data: file,
  })
  reset()
  await props.cardTemplate.deck.persist()
})

const { showConfirmation } = useConfirmation()
const handleDelete = async (attachment: CardTemplateAttachment) => {
  if (
    await showConfirmation(
      'Delete Attachment',
      `Are you sure you want to delete "${attachment.attachment.filename}"?`,
    )
  ) {
    attachment.flagShouldDelete(true)
    await attachment.deck.persist()
  }
}

const handleInsert = (attachment: CardTemplateAttachment) => {
  emit('insert', `{{${attachment.getTemplateTag()}}}`)
}
</script>

<template>
  <div class="px-3 pt-4 pb-3">
    <SidebarCollapsibleSection
      icon="attach_file"
      label="Attachments"
      action-icon="add"
      :collapsible="attachments.length > 0"
      :count="attachments.length"
      @action="open()"
    >
      <SidebarCollapsibleMenuItem
        v-for="attachment in attachments"
        :key="attachment.id"
        :active="false"
        icon="image"
        action-icon="delete"
        @click="handleInsert(attachment)"
        @action="handleDelete(attachment)"
      >
        {{ attachment.attachment.filename }}
      </SidebarCollapsibleMenuItem>
    </SidebarCollapsibleSection>
  </div>
</template>
