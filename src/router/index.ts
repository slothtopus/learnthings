import { createRouter, createWebHistory } from 'vue-router'

import DecksView from '@/views/DecksView.vue'
import DeckView from '@/views/DeckView.vue'

import { useDecksStore } from '@/stores/decks'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'decks', component: DecksView },
    {
      path: '/deck/:deckId',
      name: 'edit-deck',
      beforeEnter: (to, from, next) => {
        const deck = useDecksStore().getDeckById(to.params.deckId as string)
        if (deck === undefined) {
          next('/')
        } else {
          to.meta.deck = deck
          next()
        }
      },
      props: (route) => ({
        deck: route.meta.deck
      }),
      component: DeckView
    }
  ]
})

export default router
