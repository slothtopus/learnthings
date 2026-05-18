import { ref, watch, markRaw } from 'vue'

import { useAuth } from '@/composables/useAuth'

import { PouchDeckRegistry } from 'core/service/registry.js'
import type { TokenGenerator } from 'core/service/registry.js'
import { Deck } from 'core/Deck.js'
import { generateId } from 'core/utils/ids.js'

import { isInstanceOrThrow } from '@/lib/utils'
import { ReactiveObjectManager, registerObjects } from '@/lib/ReactiveObjectManager'
import { registerServiceObjects, SERVICE_REGISTRY } from '@/lib/services'
import type { ServiceKey } from '@/lib/services'
import { TextToSpeechField } from 'core/fields/generated.js'

const registry = new PouchDeckRegistry(
  import.meta.env['VITE_COUCH_HOST'],
  {
    username: import.meta.env['VITE_COUCH_USERNAME'],
    password: import.meta.env['VITE_COUCH_PASSWORD'],
  },
  'guest',
  import.meta.env['VITE_MEMORY_ONLY'] === 'true',
  false,
)

let serviceObjectManager: ReactiveObjectManager | undefined

const initialiseServices = async () => {
  serviceObjectManager = new ReactiveObjectManager()
  serviceObjectManager.db = await registry.initialiseMetaDB()
  registerServiceObjects(serviceObjectManager)
  await serviceObjectManager.loadAll()
  injectServices()
}

const getService = <K extends ServiceKey>(serviceId: K) => {
  if (serviceObjectManager === undefined) {
    throw new Error('Service object manager is not defined')
  }

  const { createNew, injectDependencies } = SERVICE_REGISTRY[serviceId]
  const serviceObj =
    serviceObjectManager.getObjectById(serviceId) ?? createNew(serviceObjectManager)
  return injectDependencies(serviceObj as any)
}

const injectServices = () => {
  TextToSpeechField.service = getService('google-tts')
}

const initialiseDeckObjectManager = async (deckId: string) => {
  const om = markRaw(new ReactiveObjectManager(deckId))
  registerObjects(om)
  om.db = await registry.initialiseDB(deckId)
  return om
}

const initialiseForUser = async (
  userId: string,
  tokenGenerator: TokenGenerator,
  shouldSync: boolean,
) => {
  await registry.initialise(userId, tokenGenerator, shouldSync)
  const deckIds = await registry.discover()

  await initialiseServices()

  const oms = await Promise.all(deckIds.map(initialiseDeckObjectManager))

  const start = performance.now();
  await Promise.all(oms.map((o) => o.loadAll()))
  console.log(`Loaded ${oms.length} decks in ${performance.now() - start}ms`)

  const loadedDecks = oms.map((om) => isInstanceOrThrow(om.getKeyObject(), Deck))
  loadedDecks.forEach((d) => d.createMissingCards())
  return loadedDecks
}

const _decks = ref<Deck[]>([])
const isLoading = ref(true)

export const usePouchRegistry = () => {
  const { userId, tokenGenerator } = useAuth()

  const startUserWatcher = () => {
    watch(userId, async (newUserId, oldUserId) => {
      console.log(newUserId, oldUserId)
      if (newUserId !== undefined) {
        isLoading.value = true
        _decks.value = await initialiseForUser(newUserId, tokenGenerator, newUserId != 'guest')
        isLoading.value = false
      }
    })
  }

  return { registry, startUserWatcher, isLoading }
}

export const useDecks = () => {
  const { registry } = usePouchRegistry()

  const newDeck = async (name: string) => {
    const deckId = generateId()
    const om = await initialiseDeckObjectManager(deckId)
    const deck = Deck.createNew(om, { id: deckId, name })
    om.setObject(deck)
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
  const persistDeck = async (deck: Deck) => {
    await deck.persist()
  }

  return { persistDeck }
}
