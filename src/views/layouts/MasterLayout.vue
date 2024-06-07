<script setup lang="ts">
import { Button } from '@/components/shadcn-ui/button'
import { clearAll } from '@/lib/db'
import { useRouter } from 'vue-router'

const router = useRouter()
const handleClearDB = () => {
  const userConfirmed = confirm('Are you sure you want to delete everything?')
  if (userConfirmed) {
    clearAll()
    router.push('/')
  }
}
</script>

<template>
  <div class="h-full flex flex-col bg-gradient-to-r from-sky-50 to-teal-100">
    <header class="bg-gray-700 text-white shadow grow-0 relative">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold tracking-tight"><slot name="title"></slot></h1>
      </div>
      <Button @click="handleClearDB" class="absolute right-4 top-1/2 transform -translate-y-1/2"
        >Clear DB</Button
      >
    </header>
    <main class="grow overflow-auto p-6 flex flex-col gap-4 w-full mx-auto max-w-screen-lg">
      <slot name="content"></slot>
    </main>
  </div>
</template>
