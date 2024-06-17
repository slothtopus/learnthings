import { createRouter, createWebHistory } from 'vue-router'

import DecksView from '@/views/DecksView.vue'
import DeckView from '@/views/DeckView/DeckView.vue'
import NoteTypeView from '@/views/NoteTypeView/NoteTypeView.vue'
import CardTemplateView from '@/views/CardTemplateView/CardTemplateView.vue'
import AddNoteView from '@/views/NoteView/AddNoteView.vue'
import EditNoteView from '@/views/NoteView/EditNoteView.vue'
import NotesTableView from '@/views/NotesTableView/NotesTableView.vue'
import StudyView from '@/views/StudyView/StudyView.vue'

import type { Scheduler } from '@/lib/Scheduler'

// https://router.vuejs.org/guide/advanced/meta.html#TypeScript
declare module 'vue-router' {
  interface RouteMeta {
    scheduler?: Scheduler
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'decks', component: DecksView },
    {
      path: '/deck/:deckId',
      name: 'edit-deck',
      props: true,
      component: DeckView
    },
    {
      path: '/deck/:deckId/notetype/:noteTypeId',
      name: 'edit-notetype',
      props: true,
      component: NoteTypeView
    },
    {
      path: '/deck/:deckId/notetype/:noteTypeId/new',
      name: 'new-note',
      props: true,
      component: AddNoteView
    },
    {
      path: '/deck/:deckId/notes/:noteId/edit',
      name: 'edit-note',
      props: true,
      component: EditNoteView
    },
    {
      path: '/deck/:deckId/notetype/:noteTypeId/card/:cardTemplateId',
      name: 'edit-cardtemplate',
      props: true,
      component: CardTemplateView
    },
    {
      path: '/deck/:deckId/notes',
      name: 'view-notes',
      props: true,
      component: NotesTableView
    },
    {
      path: '/study/:deckId/:cardId?',
      name: 'study',
      props: true,
      component: StudyView
    }
  ]
})

export default router
