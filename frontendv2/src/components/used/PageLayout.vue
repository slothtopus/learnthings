<script setup lang="ts">
import AppNav from '@/components/used/AppNav.vue'
import Breadcrumb from '@/components/used/Breadcrumb.vue'

withDefaults(defineProps<{
  breadcrumbs: Array<{ label: string; href?: string }>
  fullHeight?: boolean
  constrained?: boolean
}>(), {
  fullHeight: false,
  constrained: true,
})
</script>

<template>
  <div class="flex flex-col" :class="fullHeight ? 'h-screen' : 'min-h-screen'">
    <AppNav>
      <slot name="title" />
    </AppNav>

    <main class="flex-1 flex flex-col pt-15" :class="fullHeight && 'overflow-hidden'">
      <!-- Breadcrumb strip -->
      <div class="shrink-0">
        <div class="px-8 max-w-6xl mx-auto w-full pt-6 pb-2">
          <Breadcrumb :items="breadcrumbs" />
        </div>
        <div :class="constrained ? 'max-w-6xl mx-auto px-2' : ''">
          <div class="h-px bg-white/5" />
        </div>
      </div>

      <!-- Page content -->
      <div v-if="constrained" class="flex-1 flex flex-col px-8 max-w-6xl mx-auto w-full">
        <slot />
      </div>
      <slot v-else />
    </main>
  </div>
</template>
