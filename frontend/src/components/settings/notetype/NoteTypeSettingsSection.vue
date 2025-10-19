<script setup lang="ts">
import { Button } from 'primevue'

import HeaderSection from '@/components/common/HeaderSection.vue'
import NoteTypeSettingsCard from './NoteTypeSettingsCard.vue'

import CreateNewNamedObjectForm from '@/components/forms/CreateNewNamedObjectForm.vue'
import type { FormData } from '@/components/forms/CreateNewNamedObjectForm.vue'

import type { Deck } from 'core/Deck.js'

import { useFormDialog } from '@/composables/useFormDialog'
import { useDeckDetails } from '@/composables/useObjectDetails'

interface Props {
  deck: Deck
}
const props = defineProps<Props>()

const { noteTypes } = useDeckDetails(() => props.deck)
const { openDialog } = useFormDialog<FormData>(CreateNewNamedObjectForm, 'Create new note type')

const handleCreateNewNoteType = async () => {
  const result = await openDialog()
  if (!result.cancelled) {
    const { name } = result.data
    props.deck.createNewNoteType(name)
    await props.deck.persist()
  }
}
</script>

<template>
  <HeaderSection title="Note types">
    <template #controls>
      <Button
        class="ml-auto"
        label="New"
        outlined
        text
        icon="pi pi-plus"
        @click="handleCreateNewNoteType"
      />
    </template>
  </HeaderSection>
  <NoteTypeSettingsCard v-for="noteType in noteTypes" :key="noteType.id" :noteType="noteType" />
</template>

<style scoped></style>
