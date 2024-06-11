<script setup lang="ts">
import { onMounted, ref } from 'vue'

import MasterLayout from '@/views/layouts/MasterLayout.vue'
import SectionLayout from '@/views/layouts/SectionLayout.vue'
import NotesTable from '@/components/NotesTable.vue'
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn-ui/tabs'

import type { Deck } from '@/lib/Deck'
import type { Note } from '@/lib/Note'

import { useDecksStore } from '@/stores/decks'
const decksStore = useDecksStore()

interface Props {
  deckId: string
}
const props = defineProps<Props>()

const deck = ref<Deck | undefined>(undefined)
const notes = ref<Note[]>([])
onMounted(async () => {
  deck.value = await decksStore.getDeck(Number(props.deckId))
  if (deck.value !== undefined) {
    notes.value = await deck.value.getAllNotes()
  }
})

const handleEditNote = (noteId: number) => {
  console.log('edit note:', noteId)
}

const handleDeleteNote = (noteId: number) => {
  console.log('delete note', noteId)
  deck.value?.deleteNote(noteId)
  notes.value = notes.value.filter((n) => n.id != noteId)
}

const selectedTab = ref('notes')
</script>

<template>
  <MasterLayout :loading="decksStore.loading">
    <template #title>{{
      deck == undefined ? 'Deck not found' : `All notes for: ${deck.name}`
    }}</template>
    <template #content v-if="deck === undefined">
      <p>Deck with id {{ deckId }}</p>
    </template>
    <template #content v-else>
      <SectionLayout class="h-full">
        <template #title>Browse {{ selectedTab == 'notes' ? 'notes' : 'cards' }}</template>
        <template #controls>
          <Tabs default-value="notes" v-model="selectedTab" class="w-[200px]">
            <TabsList class="grid w-full grid-cols-2">
              <TabsTrigger value="notes"> Notes </TabsTrigger>
              <TabsTrigger value="cards"> Cards </TabsTrigger>
            </TabsList></Tabs
          ></template
        >
        <template #content>
          <NotesTable
            v-if="selectedTab == 'notes'"
            :deck="deck"
            :notes="notes"
            @edit="handleEditNote"
            @delete="handleDeleteNote"
          />
        </template>
      </SectionLayout>
    </template>
  </MasterLayout>
</template>

<style scoped></style>
