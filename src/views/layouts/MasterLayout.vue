<script setup lang="ts">
import { Button } from '@/components/shadcn-ui/button'
import { db } from '@/lib/dexieDB'

import BreadCrumbs from '@/components/BreadCrumbs/BreadCrumbs.vue'

interface Props {
  loading?: boolean
}
defineProps<Props>()

const handleClearDB = async () => {
  const userConfirmed = confirm('Are you sure you want to delete everything?')
  if (userConfirmed) {
    await db.delete()
    window.location.pathname = '/'
  }
}
</script>

<template>
  <div class="h-full flex flex-col bg-gradient-to-r from-sky-50 to-teal-100">
    <header class="bg-gray-700 text-white shadow grow-0 relative">
      <!--<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold tracking-tight"><slot name="title"></slot></h1>
      </div>-->
      <BreadCrumbs />
    </header>
    <main class="grow overflow-auto p-6 flex flex-col gap-4 w-full mx-auto max-w-screen-lg">
      <p v-if="loading">LOADING</p>
      <slot v-else name="content"></slot>
    </main>
    <Button @click="handleClearDB" class="absolute right-4 bottom-4">Clear DB</Button>
  </div>
</template>
