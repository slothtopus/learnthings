<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageLayout from '@/components/common/PageLayout.vue'
import NoteSearchControls from '@/components/browse-notes/NoteSearchControls.vue'
import NoteResultCard from '@/components/browse-notes/NoteResultCard.vue'

import { useRouteMetaObjects } from '@/composables/useRouteObjects'
import { useDeckDetails } from '@/composables/useObjectDetails'
import PaginationFooter from '@/components/common/PaginationFooter.vue'

import { searchNotes, noteTextFields, buildSnippet } from 'core/search.js'
import type { ResultLine } from '@/components/browse-notes/NoteResultCard.vue'
import { useConfirmation } from '@/composables/useConfirmationDialog'

const route = useRoute()
const router = useRouter()

const { getDeck } = useRouteMetaObjects()

const deck = getDeck()

const { notes, noteTypes } = useDeckDetails(deck)

const searchQuery = ref(typeof route.query.q === 'string' ? route.query.q : '')

const fieldFilter = ref(typeof route.query.field === 'string' ? route.query.field : 'all')

// Every text field in the deck, by slug — the only fields holding searchable text.
const fieldOptions = computed(() => {
  const bySlug = new Map<string, string>()
  for (const noteType of noteTypes.value) {
    for (const field of noteType.getAllFields()) {
      if (!bySlug.has(field.slug)) bySlug.set(field.slug, field.name)
    }
  }
  return [
    { value: 'all', label: 'All Fields' },
    ...[...bySlug].map(([value, label]) => ({ value, label })),
  ]
})

const noteTypeFilter = ref(typeof route.query.noteType === 'string' ? route.query.noteType : 'all')
const noteTypeOptions = computed(() => [
  { value: 'all', label: 'All Note Types' },
  ...noteTypes.value.map((n) => ({ value: n.id, label: n.name })),
])

const breadcrumbs = computed(() => [
  { label: 'Library', href: '/' },
  { label: `Deck: ${deck.name}`, href: `/deck/${deck.id}` },
  { label: 'Browse Notes' },
])

// Searching lives in core so this view and the MCP server agree on what a
// match is: case-insensitive, across every text field, not just the first.
const results = computed(() => {
  // Depend on the deck's notes explicitly. core's cached queries do read the
  // reactive version counter, so this would probably track anyway, but that is
  // an implementation detail of the cache rather than something to rely on.
  void notes.value

  return searchNotes(deck, {
    query: searchQuery.value,
    noteTypeId: noteTypeFilter.value === 'all' ? undefined : noteTypeFilter.value,
    fieldSlug: fieldFilter.value === 'all' ? undefined : fieldFilter.value,
  }).map(({ note, fields }) => ({
    note,
    lines:
      fields.length > 0
        ? fields.map(
            ({ field, text, positions }): ResultLine => ({
              label: field.name,
              snippet: buildSnippet(text, positions[0] ?? 0, searchQuery.value.trim().length),
            }),
          )
        : // Browsing: preview the note rather than highlighting nothing.
          noteTextFields(note)
            .slice(0, 1)
            .map(({ field, text }): ResultLine => ({
              label: field.name,
              snippet: buildSnippet(text, 0, 0, 120),
            })),
  }))
})

const tags = ref(['Anatomy', 'Review'])
const tagOptions = [
  'Anatomy',
  'Review',
  'Physics',
  'Chemistry',
  'Biology',
  'Mathematics',
  'History',
  'Literature',
  '2024',
  'Exam',
]

const currentPage = ref(1)
const pageSize = ref(25)

const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return results.value.slice(start, start + pageSize.value)
})

const { showConfirmation } = useConfirmation()

const handleDeleteNote = async (note: (typeof results.value)[number]['note']) => {
  const confirmed = await showConfirmation(
    'Delete this note?',
    'Its content and all of its cards will be removed. This cannot be undone.',
  )
  if (!confirmed) return
  note.delete()
  await deck.persist()
}

watch(currentPage, () => window.scrollTo({ top: 0, behavior: 'smooth' }))

// Filtering changes what page 1 means, so go back to it.
watch([searchQuery, noteTypeFilter, fieldFilter], ([q, noteType, field]) => {
  currentPage.value = 1
  router.replace({
    query: {
      ...route.query,
      q: q || undefined,
      noteType: noteType !== 'all' ? noteType : undefined,
      field: field !== 'all' ? field : undefined,
    },
  })
})
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
      <p class="text-[10px] font-light uppercase tracking-[0.3em] text-on-surface-variant mb-3">
        {{ results.length }} notes found
      </p>

      <div class="space-y-3">
        <NoteResultCard
          v-for="result in paginatedResults"
          :key="result.note.id"
          :note="result.note"
          :lines="result.lines"
          @delete="handleDeleteNote(result.note)"
          @click="
            $router.push({
              name: 'note-editor',
              params: {
                ...$route.params,
                noteTypeId: result.note.noteTypeId,
                noteId: result.note.id,
              },
            })
          "
        />
      </div>
    </div>

    <PaginationFooter v-model:current-page="currentPage" :total-results="results.length" v-model:page-size="pageSize" />
  </PageLayout>
</template>
