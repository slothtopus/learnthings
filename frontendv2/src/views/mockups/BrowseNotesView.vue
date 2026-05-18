<script setup lang="ts">
import { ref } from 'vue'
import PageLayout from '@/components/PageLayout.vue'
import NoteSearchControls from '@/components/NoteSearchControls.vue'
import AppIconButton from '@/components/AppIconButton.vue'

const breadcrumbs = [
  { label: 'Anatomy', href: '#' },
  { label: 'Academic', href: '#' },
  { label: 'Browse Notes' },
]

const searchQuery = ref('')
const fieldFilter = ref('all')
const fieldOptions = [
  { value: 'all', label: 'All Fields' },
  { value: 'front', label: 'Front' },
  { value: 'back', label: 'Back' },
]
const noteTypeFilter = ref('')
const noteTypeOptions = [
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'anatomy', label: 'Anatomy' },
  { value: 'history', label: 'History' },
]
const tags = ref(['Anatomy', 'Review'])
const tagOptions = ['Anatomy', 'Review', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'History', 'Literature', '2024', 'Exam']

const currentPage = ref(1)
const totalPages = 12

const notes = [
  { id: '1', field: 'Front', text: 'Obsidian', noteType: 'Vocabulary', cardCount: 4 },
  { id: '2', field: 'Back', text: 'The vocabulary of a person, language...', noteType: 'Anatomy', cardCount: 2 },
  { id: '3', field: 'Front', text: 'Scriptorium', noteType: 'History', cardCount: 1 },
  { id: '4', field: 'Front', text: 'Periosteum', noteType: 'Anatomy', cardCount: 3 },
  { id: '5', field: 'Back', text: 'A fibrous membrane covering the outer surface of bone, containing blood vessels and nerves.', noteType: 'Anatomy', cardCount: 3 },
  { id: '6', field: 'Front', text: 'Lacuna', noteType: 'Anatomy', cardCount: 2 },
]

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages) currentPage.value = page
}
</script>

<template>
  <PageLayout :breadcrumbs="breadcrumbs">
    <template #title>Browse Notes</template>

    <div class="mt-6 pb-28">
      <!-- Search controls -->
      <NoteSearchControls
        v-model:search="searchQuery"
        v-model:field-filter="fieldFilter"
        :field-options="fieldOptions"
        v-model:note-type-filter="noteTypeFilter"
        :note-type-options="noteTypeOptions"
        v-model:tags="tags"
        :tag-options="tagOptions"
        class="mb-6"
      />

      <!-- Results count -->
      <p class="text-[10px] font-light uppercase tracking-[0.3em] text-on-surface-variant mb-3">{{ notes.length }} notes found</p>

      <!-- Results -->
      <section class="space-y-2">
        <div
          v-for="note in notes"
          :key="note.id"
          class="group flex flex-col bg-surface-container-high hover:bg-surface-container-highest border border-transparent hover:border-outline-variant/20 transition-all duration-200 rounded-md cursor-pointer overflow-hidden"
        >
          <!-- Main row -->
          <div class="flex items-start justify-between px-4 pt-3.5 pb-3">
            <div class="flex flex-col items-start min-w-0 gap-1">
              <span class="text-[9px] font-bold tracking-widest uppercase text-on-surface-variant">{{ note.field }}</span>
              <h3 class="text-sm tracking-tight text-on-surface truncate group-hover:text-primary transition-colors font-normal">{{ note.text }}</h3>
            </div>
            <div class="flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <AppIconButton icon="delete" size="sm" />
            </div>
          </div>
          <!-- Footer strip -->
          <div class="flex items-center gap-2.5 px-4 py-2 border-t border-outline-variant/10 bg-surface-container-low/30">
            <span class="inline-flex items-center bg-primary/15 border border-primary/30 text-primary rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">{{ note.noteType }}</span>
            <span class="text-[10px] font-medium tracking-wide text-on-surface-variant/70 uppercase">Cards: {{ note.cardCount }}</span>
          </div>
        </div>
      </section>
    </div>

    <!-- Fixed footer: pagination -->
    <footer class="fixed bottom-0 left-0 w-full bg-background/90 backdrop-blur-md border-t border-outline-variant/10 z-40">
      <div class="max-w-6xl mx-auto px-8 h-14 flex items-center justify-between">
        <button
          class="w-10 h-10 flex items-center justify-center text-on-surface/60 hover:text-primary transition-colors active:scale-90 rounded-xs hover:bg-surface-container-high/50"
          @click="goToPage(currentPage - 1)"
        >
          <span class="material-symbols-outlined">chevron_left</span>
        </button>

        <nav class="flex items-center gap-1.5">
          <button
            v-for="page in [1, 2, 3, 4, 5]"
            :key="page"
            :class="[
              'w-9 h-9 flex items-center justify-center text-xs font-bold tracking-widest rounded-xs transition-all active:scale-90',
              currentPage === page ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface/60 hover:text-primary hover:bg-surface-container-high/50',
            ]"
            @click="goToPage(page)"
          >{{ page }}</button>
          <span class="text-on-surface/40 mx-1 text-xs tracking-widest">...</span>
          <button
            :class="[
              'w-9 h-9 flex items-center justify-center text-xs font-bold tracking-widest rounded-xs transition-all active:scale-90',
              currentPage === totalPages ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface/60 hover:text-primary hover:bg-surface-container-high/50',
            ]"
            @click="goToPage(totalPages)"
          >{{ totalPages }}</button>
        </nav>

        <button
          class="w-10 h-10 flex items-center justify-center text-on-surface/60 hover:text-primary transition-colors active:scale-90 rounded-xs hover:bg-surface-container-high/50"
          @click="goToPage(currentPage + 1)"
        >
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </footer>
  </PageLayout>
</template>
