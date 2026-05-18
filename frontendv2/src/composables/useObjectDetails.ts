import { computed, toValue, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'

import type { MaybeRefOrGetter } from 'vue'
import type { Deck } from 'core/Deck.js'
import type { Card } from 'core/Card.js'
import type { Note } from 'core/Note.js'
import { NoteType } from 'core/NoteType.js'

import { inspectComputedDeps } from '@/lib/deps-inspector'
import type { AnyNoteField } from 'core/fields/base.js'
import type { CardTemplate } from 'core/CardTemplate.js'

const _freezers: Ref<boolean>[] = []
export const freezeAll = () => _freezers.forEach((f) => (f.value = true))
export const unfreezeAll = () => _freezers.forEach((f) => (f.value = false))

export const useFreezableComputedRef = <T>(_computedRef: ComputedRef<T>) => {
  const frozen = ref(false)

  let _lastValue = _computedRef.value
  const computedRef = computed(() => {
    if (frozen.value) {
      return _lastValue
    } else {
      _lastValue = _computedRef.value
      return _lastValue
    }
  })

  _freezers.push(frozen)

  return { computedRef }
}

const deckDetailsMap = new Map<Deck, any>()

export const useDeckDetails = (
  deck: MaybeRefOrGetter<Deck>,
): {
  cards: ComputedRef<Card[]>
  cardCount: ComputedRef<number>
  notes: ComputedRef<Note[]>
  noteCount: ComputedRef<number>
  noteTypes: ComputedRef<NoteType[]>
} => {
  if (deckDetailsMap.has(toValue(deck))) {
    return deckDetailsMap.get(toValue(deck))
  }

  const { computedRef: cards } = useFreezableComputedRef(
    computed(() => {
      console.log('cards computed')
      return toValue(deck).getAllCards()
    }),
  )

  console.log('cards', inspectComputedDeps(cards))

  const { computedRef: cardCount } = useFreezableComputedRef(
    computed(() => {
      console.log('cardCount computed')
      return cards.value.length
    }),
  )

  const { computedRef: notes } = useFreezableComputedRef(
    computed(() => {
      console.log('notes computed')
      return toValue(deck).getAllNotes()
    }),
  )

  const { computedRef: noteCount } = useFreezableComputedRef(
    computed(() => {
      console.log('noteCount computed')
      return notes.value.length
    }),
  )

  const { computedRef: noteTypes } = useFreezableComputedRef(
    computed(() => {
      console.log('noteTypes computed')
      return toValue(deck).getAllNoteTypes()
    }),
  )

  deckDetailsMap.set(toValue(deck), { cards, cardCount, notes, noteCount, noteTypes })

  return { cards, cardCount, notes, noteCount, noteTypes }
}

const noteTypeMap = new Map<NoteType, any>()

export const useNoteTypeDetails = (
  noteType: MaybeRefOrGetter<NoteType>,
): {
  fields: ComputedRef<AnyNoteField[]>
  fieldCount: ComputedRef<number>
  cardTemplates: ComputedRef<CardTemplate[]>
  cardTemplateCount: ComputedRef<number>
  notes: ComputedRef<Note[]>
  noteCount: ComputedRef<number>
  cards: ComputedRef<Card[]>
  cardCount: ComputedRef<number>
} => {
  if (noteTypeMap.has(toValue(noteType))) {
    return noteTypeMap.get(toValue(noteType))
  }

  const { computedRef: fields } = useFreezableComputedRef(
    computed(() => {
      console.log('useNoteTypeDetails.fields computed')
      return toValue(noteType).getAllFields()
    }),
  )

  const { computedRef: fieldCount } = useFreezableComputedRef(
    computed(() => {
      console.log('useNoteTypeDetails.fieldCount computed')
      return fields.value.length
    }),
  )

  const { computedRef: cardTemplates } = useFreezableComputedRef(
    computed(() => {
      console.log('useNoteTypeDetails.cardTemplates computed')
      return toValue(noteType).getAllCardTemplates()
    }),
  )

  console.log('useNoteTypeDetails.cardTemplates', inspectComputedDeps(cardTemplates))

  const { computedRef: cardTemplateCount } = useFreezableComputedRef(
    computed(() => {
      console.log('useNoteTypeDetails.cardTemplateCount computed')
      return cardTemplates.value.length
    }),
  )

  const { computedRef: notes } = useFreezableComputedRef(
    computed(() => {
      console.log('useNoteTypeDetails.notes computed')
      return toValue(noteType).getAllNotes()
    }),
  )

  const { computedRef: noteCount } = useFreezableComputedRef(
    computed(() => {
      console.log('noteCount computed')
      return notes.value.length
    }),
  )

  const { computedRef: cards } = useFreezableComputedRef(
    computed(() => {
      console.log('useNoteTypeDetails.cards computed')
      return toValue(noteType).getAllCards()
    }),
  )

  const { computedRef: cardCount } = useFreezableComputedRef(
    computed(() => {
      console.log('cards computed')
      return cards.value.length
    }),
  )

  noteTypeMap.set(toValue(noteType), {
    fields,
    fieldCount,
    cardTemplates,
    cardTemplateCount,
    notes,
    noteCount,
    cards,
    cardCount,
  })
  return {
    fields,
    fieldCount,
    cardTemplates,
    cardTemplateCount,
    notes,
    noteCount,
    cards,
    cardCount,
  }
}
