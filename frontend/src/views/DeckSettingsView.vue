<script setup lang="ts">
import { computed } from 'vue'

import AppFrameScrollLayout from '@/layouts/AppFrameScrollLayout.vue'
import DeckInfoSettings from '@/components/settings/DeckInfoSettings.vue'
import NoteTypeSettingsSection from '@/components/settings/notetype/NoteTypeSettingsSection.vue'

import { useRouteMetaObjects } from '@/composables/useRouteObjects'
const { getDeck } = useRouteMetaObjects()
const deck = getDeck()

const breadcrumbs = computed(() => {
  return [
    { icon: 'pi pi-book', label: deck.name },
    { label: 'Settings', route: `/settings/${deck.id}` },
  ]
})
</script>

<template>
  <AppFrameScrollLayout :breadcrumbs="breadcrumbs">
    <template #content>
      <DeckInfoSettings :deck="deck" />
      <NoteTypeSettingsSection :deck="deck" />
    </template>
  </AppFrameScrollLayout>
</template>

<style scoped></style>
