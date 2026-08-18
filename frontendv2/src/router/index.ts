import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalizedGeneric } from 'vue-router'
import { addObjectsToRouteMeta } from '@/composables/useRouteObjects'
import { usePouchRegistry } from '@/composables/usePouchRegistry'
import { useAuth } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'library',
      component: () => import('@/views/DeckLibraryView.vue'),
    },
    {
      path: '/deck/:deckId',
      name: 'deck-summary',
      component: () => import('@/views/DeckSummaryView.vue'),
    },
    {
      path: '/deck/:deckId/notes',
      name: 'browse-notes',
      component: () => import('@/views/BrowseNotesView.vue'),
    },
    {
      path: '/deck/:deckId/notetype/:noteTypeId/note/:noteId',
      name: 'note-editor',
      component: () => import('@/views/NoteEditorView.vue'),
    },
    {
      path: '/deck/:deckId/notetype/:noteTypeId/template/:cardTemplateId',
      name: 'template-editor',
      component: () => import('@/views/CardTemplateEditorView.vue'),
    },
    {
      path: '/deck/:deckId/review',
      name: 'start-review',
      component: () => import('@/views/StartReviewView.vue'),
    },
    {
      path: '/deck/:deckId/review/session',
      name: 'review-next',
      component: () => import('@/views/ReviewView.vue'),
    },
    {
      path: '/loading',
      name: 'loading',
      component: () => import('@/views/LoadingScreen.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
  ],
})

const PUBLIC_ROUTES = new Set(['login', 'loading'])

router.beforeEach(async (to: RouteLocationNormalizedGeneric) => {
  if (PUBLIC_ROUTES.has(to.name as string)) return

  const { initialiseAuth, signedIn } = useAuth()
  await initialiseAuth()

  if (!signedIn.value) {
    return { name: 'login', query: { next: to.fullPath } }
  }

  const { isLoading } = usePouchRegistry()
  if (isLoading.value) {
    return { name: 'loading', query: { next: to.fullPath } }
  }
})
router.beforeEach(addObjectsToRouteMeta)

export default router
