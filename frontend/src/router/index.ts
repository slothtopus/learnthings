import { createRouter, createWebHistory } from 'vue-router'

import DecksView from '@/views/DecksView.vue'
import DeckSettingsView from '@/views/DeckSettingsView.vue'
import CreateNoteView from '@/views/CreateNoteView.vue'
import EditNoteView from '@/views/EditNoteView.vue'
import BrowseNotesView from '@/views/BrowseNotesView.vue'
import ReviewStartView from '@/views/ReviewStartView.vue'
import ReviewLayoutView from '@/views/ReviewLayoutView.vue'
import CardTemplateEditorView from '@/views/CardTemplateEditorView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

import { addObjectsToRouteMeta } from '@/composables/useRouteObjects'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { name: 'home', path: '/', component: DecksView },
    { name: 'settings', path: '/settings/:deckId', component: DeckSettingsView },
    {
      name: 'card_template_editor',
      path: '/settings/:deckId/:noteTypeId/:cardTemplateId',
      component: CardTemplateEditorView,
    },
    {
      name: 'new_note',
      path: '/notes/:deckId/:noteTypeId/new',
      component: CreateNoteView,
    },
    {
      name: 'edit_note',
      path: '/notes/:deckId/:noteTypeId/:noteId',
      component: EditNoteView,
    },
    {
      name: 'browse_notes',
      path: '/notes/:deckId/all',
      component: BrowseNotesView,
    },
    { name: 'review_start', path: '/review/:deckId/start', component: ReviewStartView },
    { name: 'review_next', path: '/review/:deckId/next', component: ReviewLayoutView },
    { name: 'not_found', path: '/not_found', component: NotFoundView },
  ],
})

router.beforeEach(addObjectsToRouteMeta)

export default router
