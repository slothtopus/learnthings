import { computed, toValue, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'

import type { MaybeRefOrGetter } from 'vue'
import type { Deck } from 'core/Deck.js'
import type { Card } from 'core/Card.js'
import type { Note } from 'core/Note.js'
import { NoteType } from 'core/NoteType.js'

import { inspectComputedDeps } from '@/lib/deps-inspector'

const _freezers: Ref<boolean>[] = []
export const freezeAll = () => _freezers.forEach((f) => (f.value = true))
export const unfreezeAll = () => _freezers.forEach((f) => (f.value = false))

export const useFreezableComputedRef = <T>(_computedRef: ComputedRef<T>) => {
  //console.log('create frozen ref for', label)

  const frozen = ref(false)

  let _lastValue = _computedRef.value
  const computedRef = computed(() => {
    //console.log(`${label}: computed with frozen = ${frozen.value}`)
    if (frozen.value) {
      //console.log(`${label}: returning frozen`)
      return _lastValue
    } else {
      //console.log(`${label}: computing live`)
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
      //return toValue(deck).objectManager.query({ include: { doctype: 'card' } }) as Card[]
      return toValue(deck).getAllCards()
    }),
    //'useDeckDetails.cards',
  )

  //const cards = computed(() => toValue(deck).getAllCards())

  console.log('cards', inspectComputedDeps(cards))

  const { computedRef: cardCount } = useFreezableComputedRef(
    computed(() => {
      console.log('cardCount computed')
      return cards.value.length
    }),
    //'useDeckDetails.cardCount',
  )

  const { computedRef: notes } = useFreezableComputedRef(
    computed(() => {
      console.log('notes computed')
      return toValue(deck).getAllNotes()
      //return toValue(deck).objectManager.query({ include: { doctype: 'note' } }) as Note[]
    }),
    //'useDeckDetails.notes',
  )

  const { computedRef: noteCount } = useFreezableComputedRef(
    computed(() => {
      console.log('noteCount computed')
      return notes.value.length
    }),
    //'useDeckDetails.noteCount',
  )

  const { computedRef: noteTypes } = useFreezableComputedRef(
    computed(() => {
      console.log('noteTypes computed')
      return toValue(deck).getAllNoteTypes()
      /*return toValue(deck).objectManager.query({
        include: { doctype: NoteType.doctype },
      }) as NoteType[]*/
    }),
    //'useDeckDetails.noteTypes',
  )

  deckDetailsMap.set(toValue(deck), { cards, cardCount, notes, noteCount, noteTypes })

  return { cards, cardCount, notes, noteCount, noteTypes }
}

const noteTypeMap = new Map<NoteType, any>()

export const useNoteTypeDetails = (noteType: MaybeRefOrGetter<NoteType>) => {
  if (noteTypeMap.has(toValue(noteType))) {
    return noteTypeMap.get(toValue(noteType))
  }

  const { computedRef: fields } = useFreezableComputedRef(
    computed(() => {
      console.log('useNoteTypeDetails.fields computed')
      return toValue(noteType).getAllFields()
      /*return toValue(noteType).objectManager.query({
        include: { doctype: NoteField.doctype, noteTypeId: toValue(noteType).id },
      }) as NoteField<any>[]*/
    }),
    //'useNoteTypeDetails.fields',
  )

  const { computedRef: fieldCount } = useFreezableComputedRef(
    computed(() => {
      console.log('useNoteTypeDetails.fieldCount computed')
      return fields.value.length
    }),
    //'useNoteTypeDetails.fieldCount',
  )

  const { computedRef: cardTemplates } = useFreezableComputedRef(
    computed(() => {
      console.log('useNoteTypeDetails.cardTemplates computed')
      return toValue(noteType).getAllCardTemplates()
    }),
    //'useNoteTypeDetails.cardTemplates',
  )

  console.log('useNoteTypeDetails.cardTemplates', inspectComputedDeps(cardTemplates))

  const { computedRef: cardTemplateCount } = useFreezableComputedRef(
    computed(() => {
      console.log('useNoteTypeDetails.cardTemplateCount computed')
      return cardTemplates.value.length
    }),
    //'useNoteTypeDetails.cardTemplateCount',
  )

  const { computedRef: notes } = useFreezableComputedRef(
    computed(() => {
      console.log('useNoteTypeDetails.notes computed')
      /*return toValue(noteType).objectManager.query({
        include: { doctype: Note.doctype, noteTypeId: toValue(noteType).id },
      }) as Note[]*/
      return toValue(noteType).getAllNotes()
    }),
    //'useNoteTypeDetails.notes',
  )

  noteTypeMap.set(toValue(noteType), {
    fields,
    fieldCount,
    cardTemplates,
    cardTemplateCount,
    notes,
  })
  return { fields, fieldCount, cardTemplates, cardTemplateCount, notes }
}

/*
export const useGatedNoteTypeDetails = (noteType: MaybeRefOrGetter<NoteType>) => {
  const fieldsComputed = computed(() => {
    console.log('fields computed')
    _lastFieldsValue = toValue(noteType).objectManager.query({
      include: { doctype: NoteField.doctype, noteTypeId: toValue(noteType).id },
    }) as NoteField<any>[]
    return _lastFieldsValue
  })
  let _lastFieldsValue: NoteField<any>[] = fieldsComputed.value

  let fields = fieldsComputed

  const freeze = () => {
    fields = computed(() => _lastFieldsValue)
  }

  const unfreeze = () => {
    fields = fieldsComputed
  }

  return { fields, freeze, unfreeze }
}*/
