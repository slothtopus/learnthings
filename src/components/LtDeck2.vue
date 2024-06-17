<script setup lang="ts">
import { ref, onMounted } from 'vue'

import type { Deck } from '@/lib/Deck'

import { Button } from '@/components/shadcn-ui/button'

import { StickyNote, BookIcon, SettingsIcon, TrashIcon, ListIcon, PlusIcon } from 'lucide-vue-next'

interface Props {
  deck: Deck
}
const props = defineProps<Props>()

defineEmits<{
  settings: [value: void]
  delete: [value: void]
  add: [value: void]
  view: [value: void]
  study: [value: void]
}>()

const statistics = ref({ notes: 0, cards: 0 })
onMounted(async () => {
  statistics.value = await props.deck.getStatistics()
})
</script>

<template>
  <section class="rounded-lg bg-white p-6 mx-auto border">
    <h2 class="whitespace-nowrap text-2xl font-semibold leading-none tracking-tight mb-6">
      {{ deck.name }}
    </h2>
    <div class="flex gap-6">
      <div class="flex gap-3">
        <div
          class="flex flex-col justify-center items-center gap-2 rounded-md bg-gray-100 p-4 dark:bg-gray-800 min-w-40"
        >
          <StickyNote />
          <p class="text-4xl font-bold">{{ statistics.notes }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">Notes</p>
        </div>
        <div
          class="flex flex-col justify-center items-center gap-2 rounded-md bg-gray-100 p-4 dark:bg-gray-800 min-w-40"
        >
          <StickyNote />
          <p class="text-4xl font-bold">{{ statistics.cards }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">Cards</p>
        </div>
      </div>
      <div class="flex flex-col w-full min-w-96 gap-3">
        <Button @click="$emit('study')">
          <BookIcon class="mr-2 h-5 w-5" />
          Study
        </Button>
        <div class="flex gap-3">
          <Button @click="$emit('browse')" variant="outline" class="w-full">
            <ListIcon class="mr-2 h-5 w-5" />
            Browse
          </Button>
          <Button @click="$emit('add')" variant="outline" class="w-full">
            <PlusIcon class="mr-2 h-5 w-5" />
            Add new
          </Button>
        </div>
        <div class="flex gap-3">
          <Button @click="$emit('settings')" variant="outline" class="w-full">
            <SettingsIcon class="mr-2 h-5 w-5" />
            Settings
          </Button>
          <Button @click="$emit('delete')" variant="outline" class="w-full">
            <TrashIcon class="mr-2 h-5 w-5" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
