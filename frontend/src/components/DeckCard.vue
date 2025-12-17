<script setup lang="ts">
import { ref, computed } from 'vue'

import { Card, Button, TieredMenu } from 'primevue'
import RoundedContainer from '@/components/common/RoundedContainer.vue'

import type { Deck } from 'core/Deck.js'
import { useDeckDetails } from '@/composables/useObjectDetails'

import { useRouter } from 'vue-router'

interface Props {
  deck: Deck
}
const props = defineProps<Props>()

defineEmits(['delete'])

const handleExport = () => {
  console.log('handleExport')
}

const { cardCount, noteCount, noteTypes } = useDeckDetails(() => props.deck)


const router = useRouter()
const noteMenuItems = computed(() => {
  return [
    {
      icon: 'pi pi-plus',
      label: 'New with notetype',
      items: noteTypes.value.map((n) => ({
        icon: 'pi pi-book',
        label: n.name,
        command: () => {
          router.push({
            name: 'new_note',
            params: { deckId: props.deck.id, noteTypeId: n.id },
          })
          console.log('new with notetype', n)
        },
      })),
    },
    {
      icon: 'pi pi-eye',
      label: 'Browse notes',
      command: () => {
        router.push({ name: 'browse_notes', params: { deckId: props.deck.id } })
      },
    },
  ]
})
const noteMenu = ref<{ toggle: (e: any) => void } | null>(null)
const toggleNoteMenu = (event: any) => {
  noteMenu.value?.toggle(event)
}
</script>

<template>
  <Card class="border border-gray-500 w-full max-w-4xl">
    <template #header>
      <div class="flex p-5 pb-0">
        <h2 class="justify-center sm:text-2xl text-xl dark:text-gray-300">{{ deck.name }}</h2>
        <Button
          class="ml-auto"
          text
          rounded
          severity="secondary"
          size="small"
          icon="pi pi-file-export"
          @click="handleExport"
        />
        <Button
          text
          rounded
          severity="secondary"
          size="small"
          icon="pi pi-cog"
          @click="$router.push({ name: 'settings', params: { deckId: deck.id } })"
        />
        <Button
          text
          rounded
          severity="secondary"
          size="small"
          icon="pi pi-times"
          @click="$emit('delete')"
        />
      </div>
    </template>
    <template #content>
      <div>
        <div class="flex gap-4 flex-col sm:flex-row">
          <RoundedContainer class="h-12 flex items-center gap-2">
            <i class="pi pi-book" />
            <span class="ml-2 dark:text-gray-300 font-thin">Notes:</span>
            <span class="ml-2 font-light">{{ noteCount }}</span>
            <Button
              class="ml-auto sm:ml-4"
              icon="pi pi-ellipsis-v"
              rounded
              size="small"
              severity="secondary"
              aria-haspopup="true"
              aria-controls="note-menu"
              @click="toggleNoteMenu"
            />
            <TieredMenu ref="noteMenu" id="note-menu" :model="noteMenuItems" :popup="true" />
          </RoundedContainer>
          <RoundedContainer class="h-12 flex items-center gap-2">
            <i class="pi pi-file" />
            <span class="ml-2 dark:text-gray-300 font-thin">Cards:</span>
            <span class="ml-2 font-light">{{ cardCount }}</span>
          </RoundedContainer>

          <Button
            class="sm:ml-auto h-12"
            outlined
            :label="`Review Cards`"
            :pt:label="'text-nowrap'"
            size="small"
            @click="$router.push({ name: 'review_start', params: { deckId: deck.id } })"
          />
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped></style>
