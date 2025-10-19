<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

import { Button, Select, FloatLabel } from 'primevue'

import AppFrameScrollLayout from '@/layouts/AppFrameScrollLayout.vue'
import HeaderSection from '@/components/common/HeaderSection.vue'
import NoteEditor from '@/components/note/NoteEditor.vue'

import { useRouteMetaObjects } from '@/composables/useRouteObjects'
import { useDeckDetails } from '@/composables/useObjectDetails'
import { useConfirmation } from '@/composables/useConfirmationDialog'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'

const { getDeck, getNoteType } = useRouteMetaObjects()

const deck = getDeck()
const noteType = getNoteType()

const { noteTypes } = useDeckDetails(deck)

const noteTypeOptions = computed(() => {
  return noteTypes.value.map((n) => ({ name: n.name, id: n.id }))
})
const selectedNoteType = ref(noteType.id)

const note = reactive(noteType.createNewNote())

const router = useRouter()
const route = useRoute()
const handleSaveNote = async () => {
  await deck.persist()
  router.push({ name: 'edit_note', params: { ...route.params, noteId: note.id } })
}

const fieldContentChanged = computed(() =>
  note
    .getAllFieldContent(true)
    .some((c) => c.shouldPersist() || (!c.isUnsaved() && c.shouldDelete())),
)
const canSave = computed(() => note.shouldPersist() || fieldContentChanged.value)

const { confirm } = useConfirmation()
onBeforeRouteLeave(async () => {
  if (canSave.value) {
    if (await confirm('Are you sure?', 'Leaving this page will lose unsaved changes')) {
      note.resetToLastPersisted()
    } else {
      return false
    }
  }

  if (note.isUnsaved()) {
    note.delete()
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
      route: `/notes/${deck.id}/${noteType.id}/new`,
    },
  ]
})
</script>

<template>
  <AppFrameScrollLayout :breadcrumbs="breadcrumbs">
    <template #title>Create new note</template>
    <template #content>
      <HeaderSection :title="`New '${noteType.name}' note`">
        <template #controls>
          <FloatLabel class="w-full max-w-3xs" variant="on">
            <Select
              class="w-full"
              inputId="notetype-select"
              v-model="selectedNoteType"
              :options="noteTypeOptions"
              optionLabel="name"
              optionValue="id"
            />
            <label for="notetype-select">Select note type</label>
          </FloatLabel>
          <Button
            class="ml-4 flex-none"
            :disabled="!canSave"
            outlined
            text
            icon="pi pi-save"
            label="Save"
            :pt="{ label: 'hidden sm:block' }"
            @click="handleSaveNote"
          />
        </template>
      </HeaderSection>
      <NoteEditor :note="note" />
    </template>
  </AppFrameScrollLayout>
</template>

<style scoped></style>
