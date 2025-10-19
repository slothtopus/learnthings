<script setup lang="ts">
import { computed } from 'vue'

import { Button } from 'primevue'
import { useToast } from 'primevue/usetoast'

import AppFrameScrollLayout from '@/layouts/AppFrameScrollLayout.vue'
import NoteEditor from '@/components/note/NoteEditor.vue'
import HeaderSection from '@/components/common/HeaderSection.vue'

import { useConfirmation } from '@/composables/useConfirmationDialog'
import { useRouteMetaObjects } from '@/composables/useRouteObjects'
import { useRouter, onBeforeRouteLeave } from 'vue-router'

const { getDeck, getNote } = useRouteMetaObjects()

const note = getNote()
const deck = getDeck()

const handleSaveNote = async () => {
  await deck.persist()
}

const toast = useToast()
const router = useRouter()
const handleDeleteNote = async () => {
  note.delete()
  router.push({ name: 'browse_notes', params: { deckId: deck.id } })
  toast.add({ severity: 'success', summary: 'Note deleted', detail: 'Note deleted', life: 3000 })
}

const handleNew = () => {
  router.push({ name: 'new_note', params: { deckId: deck.id, noteTypeId: note.noteTypeId } })
}

const fieldContentChanged = computed(() =>
  note
    .getAllFieldContent(true)
    .some((c) => c.shouldPersist() || (!c.isUnsaved() && c.shouldDelete())),
)
const canSave = computed(() => note.shouldPersist() || fieldContentChanged.value)

const { confirm } = useConfirmation()
onBeforeRouteLeave(async () => {
  if (canSave.value && !note.shouldDelete()) {
    if (await confirm('Are you sure?', 'Leaving this page will lose unsaved changes')) {
      note.resetToLastPersisted()
    } else {
      return false
    }
  }
  await deck.persist()
})

const breadcrumbs = computed(() => {
  return [
    { icon: 'pi pi-book', label: deck.name },
    {
      label: 'Notes',
      route: `/notes/${deck.id}/all`,
    },
    {
      label: 'Edit note',
      route: `/notes/${deck.id}/${note.noteTypeId}/${note.id}`,
    },
  ]
})
</script>

<template>
  <AppFrameScrollLayout :breadcrumbs="breadcrumbs">
    <template #content>
      <HeaderSection :title="`Edit '${note.noteType.name}' note`">
        <template #controls>
          <Button
            class="ml-4 flex-none"
            outlined
            text
            icon="pi pi-plus"
            label="New"
            :pt="{ label: 'hidden sm:block' }"
            @click="handleNew"
          />
          <Button
            class="flex-none"
            outlined
            text
            icon="pi pi-save"
            label="Update"
            :disabled="!canSave"
            :pt="{ label: 'hidden sm:block' }"
            @click="handleSaveNote"
          />
          <Button
            class="flex-none"
            outlined
            text
            icon="pi pi-trash"
            label="Delete"
            :pt="{ label: 'hidden sm:block' }"
            @click="handleDeleteNote"
          />
        </template>
      </HeaderSection>
      <NoteEditor :note="note" />
    </template>
  </AppFrameScrollLayout>
</template>

<style scoped></style>
