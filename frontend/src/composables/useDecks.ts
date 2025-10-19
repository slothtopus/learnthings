import { ref, reactive, markRaw } from 'vue'

import { ReactiveObjectManager, registerObjects } from '@/lib/ReactiveObjectManager'

import PersistProgress from '@/components/common/PersistProgress.vue'
import { useDialog } from 'primevue'
import { ProgressMonitor } from 'core/ObjectManager.js'
import { usePouchRegistry } from './usePouchRegistry'
import { generateId } from 'core/utils/ids.js'
import { Deck } from 'core/Deck.js'

const _decks = ref<Deck[]>([])

export const useDecks = () => {
  const { registry } = usePouchRegistry()

  const newDeck = async (name: string) => {
    const deckId = generateId()
    const om = markRaw(new ReactiveObjectManager(deckId))
    registerObjects(om)
    const deck = Deck.createNewEmpty(om, { id: deckId, name })
    om.setObject(deck)
    om.db = await registry.initialiseDB(deckId)
    await deck.persist()
    _decks.value.push(deck)
    return deck
  }

  const deleteDeck = async (deckId: string) => {
    const deckIndex = _decks.value.findIndex((d) => d.id == deckId)
    _decks.value.splice(deckIndex, 1)
    await registry.delete(deckId)
  }

  const getDeckById = (id: string) => {
    return _decks.value.find((d) => d.id === id)
  }

  return { decks: _decks, newDeck, deleteDeck, getDeckById }
}

export const usePersistDeck = () => {
  const dialog = useDialog()
  const persistDeck = async (deck: Deck, message = 'Updating') => {
    const progressMonitor = reactive(new ProgressMonitor())
    const instance = dialog.open(PersistProgress, {
      props: {
        header: message,
        modal: true,
        closable: false,
        pt: { root: 'w-full max-w-xs', title: 'mr-4 text-nowrap' },
      },
      data: {
        progressMonitor,
      },
    })
    await deck.persist(progressMonitor)
    instance.close()
  }

  return { persistDeck }
}
