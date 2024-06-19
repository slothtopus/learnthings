<script setup lang="ts">
import { useSheet } from '@/composables/useSheet'

import { Button } from '@/components/shadcn-ui/button'
import { XIcon } from 'lucide-vue-next'

const { closeSheet } = useSheet()
</script>

<template>
  <section
    class="rounded-t-lg bg-white shadow-md flex flex-col w-full mx-auto max-w-screen-lg pb-6"
    @click.stop
  >
    <aside class="w-full flex justify-end items-center p-6 pb-2 items-end gap-3">
      <h2
        class="text-2xl font-bold tracking-tight mr-auto whitespace-nowrap text-ellipsis overflow-hidden"
      >
        <slot name="title"></slot>
      </h2>
      <Button variant="outline" size="icon" class="close-button" @click="closeSheet">
        <XIcon class="w-4 h-4" />
      </Button>
    </aside>
    <main class="grow overflow-auto p-6 flex flex-col gap-3">
      <slot name="content"></slot>
    </main>
  </section>
</template>
