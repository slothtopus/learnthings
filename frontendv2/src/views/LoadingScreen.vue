<script setup lang="ts">
import { watch } from 'vue'
import { useRouter } from 'vue-router'

import { usePouchRegistry } from '@/composables/usePouchRegistry'
import { pause } from '@/lib/utils'

const router = useRouter()
const { isLoading } = usePouchRegistry()

const loadingPause = pause(1000)

watch(
  isLoading,
  async (val) => {
    if (!val) {
      await loadingPause
      const nextRoute = router.currentRoute.value.query['next']
      const nextRouteString = Array.isArray(nextRoute) ? nextRoute[0] : nextRoute
      router.push(nextRouteString ?? '/')
    }
  },
  { immediate: true },
)
</script>

<template>
  <div
    class="fixed inset-0 flex flex-col items-center justify-center gap-12"
    style="background: radial-gradient(circle at top left, #1c1f22 0%, #0c0e10 100%)"
  >
    <!-- Wordmark -->
    <div class="flex flex-col items-center gap-3">
      <span class="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
        learnthings
      </span>
      <h1 class="text-4xl font-extralight tracking-wide text-on-surface">Loading</h1>
    </div>

    <!-- Animated bar -->
    <div class="w-48 h-px bg-surface-container-highest overflow-hidden rounded-full">
      <div class="h-full bg-primary rounded-full animate-slide" />
    </div>
  </div>
</template>

<style scoped>
@keyframes slide {
  0% {
    transform: translateX(-100%);
    width: 40%;
  }
  50% {
    width: 60%;
  }
  100% {
    transform: translateX(250%);
    width: 40%;
  }
}

.animate-slide {
  animation: slide 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
</style>
