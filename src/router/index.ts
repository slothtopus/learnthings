import { createRouter, createWebHistory } from 'vue-router'

import DecksView from '@/views/DecksView.vue'
import DeckView from '@/views/DeckView/DeckView.vue'
import NoteTypeView from '@/views/NoteTypeView/NoteTypeView.vue'
import CardTemplateView from '@/views/CardTemplateView/CardTemplateView.vue'
import NoteView from '@/views/NoteView/NoteView.vue'

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
      path: '/deck/:deckId/notetype/:noteTypeId/card/:cardTemplateId',
      name: 'edit-cardtemplate',
      props: true,
      component: CardTemplateView
    },
    { path: '/noteview', component: NoteView }
  ]
})

export default router
