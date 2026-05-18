<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'

import { useAuth } from './composables/useAuth'
import { usePouchRegistry } from './composables/usePouchRegistry'
import DialogHost from './components/DialogHost.vue'
import { TooltipProvider } from '@/components/ui/tooltip'

const { initialiseAuth } = useAuth()
const { startUserWatcher } = usePouchRegistry()

onMounted(async () => {
  startUserWatcher()
  await initialiseAuth()
})
</script>

<template>
  <TooltipProvider :delay-duration="400">
    <RouterView />
    <DialogHost />
  </TooltipProvider>
</template>
