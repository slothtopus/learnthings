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
          breadcrumb: { resource: 'simple', title: 'Notetype: settings', name: 'settings-notetype' }
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
                resource: 'simple',
                title: 'Template: settings',
                name: 'settings-template'
              }
            }
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      meta: { breadcrumb: { resource: 'simple', title: 'All decks', name: 'decks' } },
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
                breadcrumb: { resource: 'simple', title: 'Deck: settings', name: 'settings-deck' }
              },
              children: settingsRoutes
            },
            {
              path: 'notes',
              meta: {
                breadcrumb: {
                  resource: 'simple',
                  title: 'Deck: notes',
                  name: 'browse-notes'
                }
              },
              children: [
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
                    breadcrumb: { resource: 'simple', title: 'Note: add', name: 'new-note' }
                  }
                },
                {
                  path: 'edit/:noteId',
                  name: 'edit-note',
                  props: true,
                  component: EditNoteView,
                  meta: {
                    breadcrumb: {
                      resource: 'simple',
                      title: 'Note: edit',
                      name: 'edit-note'
                    }
                  }
                }
              ]
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
/*{
      path: '/',
      name: 'decks',
      component: DecksView,
      meta: { breadcrumbs: [{ resource: 'simple', name: 'All decks' }] }
    },
    {
      path: '/deck/:deckId',
      name: 'edit-deck',
      props: true,
      component: DeckView,
      meta: {
        breadcrumbs: [
          { resource: 'simple', name: 'All decks', route: { name: 'decks' } },
          { resource: 'deck', id: 'deckId' }
        ]
      }
    },
    {
      path: '/deck/:deckId/notetype/:noteTypeId',
      name: 'edit-notetype',
      props: true,
      component: NoteTypeView,
      meta: {
        breadcrumbs: [
          { resource: 'simple', name: 'All decks', route: { name: 'decks' } },
          { resource: 'deck', id: 'deckId' },
          { resource: 'notetype', id: 'noteTypeId' }
        ]
      }
    },*/
/*{
      path: '/deck/:deckId/notetype/:noteTypeId/new',
      name: 'new-note',
      props: true,
      component: AddNoteView,
      meta: {
        breadcrumbs: [
          { resource: 'simple', name: 'All decks', route: { name: 'decks' } },
          { resource: 'deck', id: 'deckId' },
          { resource: 'notetype', id: 'noteTypeId' },
          'New'
        ]
      }
    },*/
/*{
      path: '/deck/:deckId/notes/:noteId/edit',
      name: 'edit-note',
      props: true,
      component: EditNoteView,
      meta: {
        breadcrumbs: [
          { resource: 'simple', name: 'All decks', route: { name: 'decks' } },
          { resource: 'deck', id: 'deckId' },
          { resource: 'note', id: 'noteId' },
          'Edit'
        ]
      }
    },*/
/*{
      path: '/deck/:deckId/notetype/:noteTypeId/card/:cardTemplateId/edit',
      name: 'edit-cardtemplate',
      props: true,
      component: CardTemplateView,
      meta: {
        breadcrumbs: [
          { resource: 'simple', name: 'All decks', route: { name: 'decks' } },
          { resource: 'deck', id: 'deckId' },
          { resource: 'notetype', id: 'noteTypeId' },
          { resource: 'cardtemplate', id: 'cardTemplateId' },
          'Edit'
        ]
      }
    },*/
/*{
      path: '/deck/:deckId/notes',
      name: 'view-notes',
      props: true,
      component: NotesTableView,
      meta: {
        breadcrumbs: [
          { resource: 'simple', name: 'All decks', route: { name: 'decks' } },
          { resource: 'deck', id: 'deckId' },
          'All notes'
        ]
      }
    },*/

router.beforeResolve((to) => {
  if (to.meta.breadcrumb) {
    to.meta.breadcrumb = { ...to.meta.breadcrumb, path: to.path }
  }
})

export default router
