<script setup lang="ts">
import { watch, onMounted, markRaw } from 'vue'

import DynamicDialog from 'primevue/dynamicdialog'
import Toast from 'primevue/toast'

import { useAuth } from './composables/useAuth'
import { useDecks } from './composables/useDecks'
import { tokenGenerator } from './lib/auth'
import { usePouchRegistry } from './composables/usePouchRegistry'
import { ReactiveObjectManager, registerObjects } from './lib/ReactiveObjectManager'

const { initialiseAuth, userId } = useAuth()
const { registry } = usePouchRegistry()
const { decks } = useDecks()

onMounted(async () => {
  await initialiseAuth()
})

watch(userId, async (newUserId, oldUserId) => {
  console.log(newUserId, oldUserId)
  if (newUserId !== undefined) {
    await registry.initialise(newUserId, tokenGenerator, newUserId != 'guest')
    const deckIds = await registry.discover()
    const oms = await Promise.all(
      deckIds.map(async (id) => {
        const om = markRaw(new ReactiveObjectManager(id))
        registerObjects(om)
        om.db = await registry.initialiseDB(id)
        return om
      }),
    )
    await Promise.all(oms.map((o) => o.loadAll()))
    const loadedDecks = oms.map((om) => om.getDeck())
    loadedDecks.forEach((d) => d.createMissingCards())
    decks.value = loadedDecks
  }
})

/*

const router = useRouter()
watch(userId, async (newUserId, oldUserId) => {
  console.log('watch', oldUserId, newUserId)
  initialised.value = false
  if (newUserId !== undefined) {
    const initialPause = pause(1000)
    await registry.initialise(newUserId, tokenGenerator, newUserId != 'guest')
    intialisationMessage.value = 'Synchronising'
    const deckIds = await registry.discover()
    const decks = await Promise.all(deckIds.map((deckId) => registry.get(deckId)))
    intialisationMessage.value = 'Loading decks'
    await Promise.all(decks.map((d) => d.load()))
    intialisationMessage.value = 'Starting...'
    setDecks(decks)
    router.push({ name: 'home' })
    await initialPause
    initialised.value = true
  }
})
  */
</script>

<template>
  <RouterView />
  <DynamicDialog />
  <Toast position="bottom-right" />
</template>

<style>
#app {
  min-width: 360px;
  min-height: 480px;
}

@media (max-width: 640px) {
  :root {
    font-size: 14px;
  }
}

.firebase-emulator-warning {
  display: none;
}
</style>
