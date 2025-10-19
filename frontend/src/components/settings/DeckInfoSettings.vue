<script setup lang="ts">
import { Card } from 'primevue'

import HeaderSection from '@/components/common/HeaderSection.vue'
import FieldContainer from '@/components/common/FieldContainer.vue'

import type { Deck } from 'core/Deck.js'

interface Props {
  deck: Deck
}
defineProps<Props>()

const handleEdit = () => {
  console.log('handleEdit')
}
</script>

<template>
  <HeaderSection title="Deck info" />
  <Card class="border dark:border-gray-500 w-full">
    <template #content>
      <FieldContainer subtitle="Name" :title="deck.name" :controls="['edit']" @edit="handleEdit" />
    </template>
  </Card>
</template>

<style scoped></style>
