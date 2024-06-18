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

const settingsRoutes = [
  {
    path: '',
    name: 'settings-deck',
    props: true,
    component: DeckView
  },
  {
    path: 'notetypes/:noteTypeId',
    children: [
      {
        path: '',
        meta: {
          breadcrumb: {
            resource: 'notetype',
            icon: 'settings',
            title: 'Notetype',
            name: 'settings-notetype'
          }
        },
        children: [
          {
            path: '',
            name: 'settings-notetype',
            props: true,
            component: NoteTypeView
          },
          {
            path: 'template/:cardTemplateId',
            name: 'settings-template',
            props: true,
            component: CardTemplateView,
            meta: {
              breadcrumb: {
                resource: 'template',
                icon: 'settings',
                title: 'Template',
                name: 'settings-template'
              }
            }
          }
        ]
      }
    ]
  }
]

const notesRoutes = [
  {
    path: '',
    name: 'browse-notes',
    props: true,
    component: NotesTableView
  },
  {
    path: 'new/:noteTypeId',
    name: 'new-note',
    props: true,
    component: AddNoteView,
    meta: {
      breadcrumb: { resource: 'notetype', icon: 'add', title: 'Note', name: 'new-note' }
    }
  },
  {
    path: 'edit/:noteId',
    name: 'edit-note',
    props: true,
    component: EditNoteView,
    meta: {
      breadcrumb: {
        resource: 'note',
        icon: 'edit',
        title: 'Note',
        name: 'edit-note'
      }
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      meta: { breadcrumb: { resource: 'text', icon: 'home', title: 'All decks', name: 'decks' } },
      children: [
        {
          path: '',
          name: 'decks',
          component: DecksView
        },
        {
          path: 'deck/:deckId',
          children: [
            {
              path: 'settings',
              meta: {
                breadcrumb: {
                  resource: 'deck',
                  icon: 'settings',
                  title: 'Deck',
                  name: 'settings-deck'
                }
              },
              children: settingsRoutes
            },
            {
              path: 'notes',
              meta: {
                breadcrumb: {
                  resource: 'deck',
                  icon: 'notes',
                  title: 'Deck',
                  name: 'browse-notes'
                }
              },
              children: notesRoutes
            }
          ]
        }
      ]
    },
    {
      path: '/study/:deckId/:cardId?',
      name: 'study',
      props: true,
      component: StudyView
    }
  ]
})

router.beforeResolve((to) => {
  if (to.meta.breadcrumb) {
    to.meta.breadcrumb = { ...to.meta.breadcrumb, path: to.path }
  }
})

export default router
