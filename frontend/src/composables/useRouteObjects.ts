import { useRoute } from 'vue-router'
import type { NavigationGuardNext, RouteLocationNormalizedGeneric } from 'vue-router'
import { useDecks } from './useDecks'
import { Deck } from 'core/Deck.js'
import { NoteType } from 'core/NoteType.js'
import { CardTemplate } from 'core/CardTemplate.js'
import { Note } from 'core/Note.js'

const paramToString = (param: string | string[] | null) => (Array.isArray(param) ? param[0] : param)

const getDeck = (deckId: string) => {
  const { getDeckById } = useDecks()
  const deck = getDeckById(deckId)
  return deck instanceof Deck ? deck : undefined
}

const getNoteType = (deck: Deck, noteTypeId: string) => {
  const noteType = deck.objectManager.query({
    include: { doctype: NoteType.doctype, id: noteTypeId },
  })[0]
  return noteType instanceof NoteType ? noteType : undefined
}

const getCardTemplate = (deck: Deck, cardTemplateId: string) => {
  const cardTemplate = deck.objectManager.query({
    include: { doctype: CardTemplate.doctype, id: cardTemplateId },
  })[0]
  return cardTemplate instanceof CardTemplate ? cardTemplate : undefined
}

/*
const getCardTemplateNew = (deck: Deck, cardTemplateId: string) => {
  const cardTemplate = deck.objectManager.query({
    include: { doctype: CardTemplateNew.doctype, id: cardTemplateId },
  })[0]
  return cardTemplate instanceof CardTemplateNew ? cardTemplate : undefined
}*/

const getNote = (deck: Deck, noteId: string) => {
  const note = deck.objectManager.query({
    include: { doctype: Note.doctype, id: noteId },
  })[0]
  return note instanceof Note ? note : undefined
}

export const addObjectsToRouteMeta = async (
  to: RouteLocationNormalizedGeneric,
  from: RouteLocationNormalizedGeneric,
  next: NavigationGuardNext,
) => {
  const deckId = paramToString(to.params.deckId)
  const noteTypeId = paramToString(to.params.noteTypeId)
  const cardTemplateId = paramToString(to.params.cardTemplateId)
  const noteId = paramToString(to.params.noteId)

  const routeBack = () => {
    if (!from.name) {
      return next({ name: 'home' })
    } else {
      return next(false)
    }
  }

  try {
    if (deckId) {
      const deck = getDeck(deckId)
      if (deck === undefined) {
        console.error(`deck with id ${deckId} not found`)
        return routeBack()
      }
      to.meta['deck'] = deck

      if (noteTypeId) {
        const noteType = getNoteType(deck, noteTypeId)
        if (noteType === undefined) {
          console.error(`note type with id ${noteTypeId} not found`)
          return routeBack()
        }
        to.meta['noteType'] = noteType
      }

      if (cardTemplateId) {
        const cardTemplate = getCardTemplate(deck, cardTemplateId)
        console.log(`get crdTemplate with id`, cardTemplateId)
        if (cardTemplate === undefined) {
          console.error(`card template with id ${cardTemplateId} not found`)
          return routeBack()
        }
        to.meta['cardTemplate'] = cardTemplate
      }

      if (noteId) {
        const note = getNote(deck, noteId)
        if (note === undefined) {
          console.error(`note with id ${noteId} not found`)
          return routeBack()
        }
        to.meta['note'] = note
      }
    }
  } catch (err) {
    console.error('Failed to load resources:', err)
  }
  return next()
}

export const useRouteMetaObjects = () => {
  const route = useRoute()

  const getDeckIfExists = () => {
    if (route.meta.deck instanceof Deck) {
      return route.meta.deck
    } else {
      return undefined
    }
  }
  const getDeck = () => {
    const deck = getDeckIfExists()
    if (deck) {
      return deck
    } else {
      throw Error(`deck not found in route meta`)
    }
  }

  const getNoteType = () => {
    if (route.meta.noteType instanceof NoteType) {
      return route.meta.noteType
    } else {
      throw Error(`note type not found in route meta`)
    }
  }

  const getCardTemplate = () => {
    if (route.meta.cardTemplate instanceof CardTemplate) {
      return route.meta.cardTemplate
    } else {
      throw Error(`card template not found in route meta`)
    }
  }

  const getNote = () => {
    if (route.meta.note instanceof Note) {
      return route.meta.note
    } else {
      throw Error(`note not found in route meta`)
    }
  }

  return { getDeck, getDeckIfExists, getNoteType, getCardTemplate, getNote }
}
