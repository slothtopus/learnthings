<script setup lang="ts">
import NoteTypeCard from '@/components/deck-summary/NoteTypeCard.vue'
import CreateButton from '@/components/used/CreateButton.vue'
import LinkButton from '@/components/used/LinkButton.vue'
import NoteTypeDetailsDialog from '@/components/deck-summary/NoteTypeDetailsDialog.vue'
import type {
  NoteTypeDetailsFormData,
  NoteTypeDetailsDialogContext,
} from '@/components/deck-summary/NoteTypeDetailsDialog.vue'

import { useDeckDetails, useNoteTypeDetails } from '@/composables/useObjectDetails'
import { useRouteMetaObjects } from '@/composables/useRouteObjects'
import { useFormDialog } from '@/composables/useFormDialog'
import { useConfirmation } from '@/composables/useConfirmationDialog'

import type { NoteType } from 'core/NoteType.js'

const { getDeck } = useRouteMetaObjects()
const deck = getDeck()

const { noteTypes } = useDeckDetails(deck)

const noteTypeDetailsDialog = useFormDialog<NoteTypeDetailsFormData, NoteTypeDetailsDialogContext>(
  NoteTypeDetailsDialog,
)

const handleCreateNewNoteType = async () => {
  const result = await noteTypeDetailsDialog.open({ name: '', description: '' }, { mode: 'new' })
  if (!result.cancelled) {
    const { name } = result.data
    deck.createNewNoteType(name)
    await deck.persist()
  }
}

const handleEditNoteTypeDetails = async (noteType: NoteType) => {
  const result = await noteTypeDetailsDialog.open(
    { name: noteType.name, description: '' },
    { mode: 'edit' },
  )
  if (!result.cancelled) {
    const { name } = result.data
    noteType.setName(name)
    await deck.persist()
  }
}

const { showConfirmation } = useConfirmation()
const handleDeleteNoteType = async (noteType: NoteType) => {
  const { noteCount, cardCount } = useNoteTypeDetails(noteType)
  if (
    await showConfirmation(
      'Delete Note Type',
      `Deleting this Note Type will also delete ${noteCount.value} notes and ${cardCount.value} cards. Are you sure?`,
    )
  ) {
    noteType.delete()
    await deck.persist()
  }
}
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-center justify-between px-1">
      <h2 class="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface/40">
        Note Types
      </h2>
      <LinkButton
        label="Browse All Notes"
        @click="$router.push({ name: 'browse-notes', params: { deckId: deck.id } })"
      />
    </div>

    <div class="flex flex-col gap-4">
      <NoteTypeCard
        v-for="nt in noteTypes"
        :key="nt.id"
        :noteType="nt"
        @settings="handleEditNoteTypeDetails(nt)"
        @delete="handleDeleteNoteType(nt)"
        @new="
          $router.push({
            name: 'note-editor',
            params: { deckId: deck.id, noteTypeId: nt.id, noteId: 'new' },
          })
        "
        @browse="
          $router.push({
            name: 'browse-notes',
            params: { deckId: deck.id },
            query: { noteType: nt.id },
          })
        "
      />

      <CreateButton label="New Note Type" size="lg" @click="handleCreateNewNoteType" />
    </div>
  </section>
</template>

<style scoped></style>
