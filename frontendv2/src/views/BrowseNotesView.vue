<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageLayout from '@/components/PageLayout.vue'
import NoteSearchControls from '@/components/browse-notes/NoteSearchControls.vue'
import NoteResultCard from '@/components/browse-notes/NoteResultCard.vue'

import { useRouteMetaObjects } from '@/composables/useRouteObjects'
import { useDeckDetails } from '@/composables/useObjectDetails'
import PaginationFooter from '@/components/used/PaginationFooter.vue'

import { TextField, TextFieldContent } from 'core/fields/fields.js'

const route = useRoute()
const router = useRouter()

const { getDeck } = useRouteMetaObjects()

const deck = getDeck()

const { notes, noteTypes } = useDeckDetails(deck)

const searchQuery = ref(typeof route.query.q === 'string' ? route.query.q : '')

const fieldFilter = ref('all')
const fieldOptions = computed(() => [{ value: 'all', label: 'All' }])

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

const fieldContentResults = computed(() =>
  notes.value.flatMap((n) => {
    if (noteTypeFilter.value !== 'all' && n.noteType.id !== noteTypeFilter.value) {
      return []
    }

    const fields = n.noteType.getAllFields()
    const textFieldContent = fields
      .filter((f) => f instanceof TextField)
      .map((f) => f.getContent(n))
      .filter(Boolean) as TextFieldContent[]

    if (searchQuery.value.length > 0) {
      const contentMatch = textFieldContent.find((f) =>
        (f.getContent() ?? '').includes(searchQuery.value),
      )
      return contentMatch ? [contentMatch] : []
    } else {
      return textFieldContent.length > 0 ? textFieldContent[0] : []
    }
  }),
)

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
  return fieldContentResults.value.slice(start, start + pageSize.value)
})

watch(currentPage, () => window.scrollTo({ top: 0, behavior: 'smooth' }))

watch([searchQuery, noteTypeFilter], ([q, noteType]) => {
  router.replace({
    query: {
      ...route.query,
      q: q || undefined,
      noteType: noteType !== 'all' ? noteType : undefined,
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
        {{ fieldContentResults.length }} notes found
      </p>

      <div class="space-y-3">
        <NoteResultCard
          v-for="f in paginatedResults"
          :key="f.id"
          :field-content="f"
          @click="
            $router.push({
              name: 'note-editor',
              params: { ...$route.params, noteTypeId: f.field.noteTypeId, noteId: f.noteId },
            })
          "
        />
      </div>
    </div>

    <PaginationFooter v-model:current-page="currentPage" :total-results="fieldContentResults.length" v-model:page-size="pageSize" />
  </PageLayout>
</template>
