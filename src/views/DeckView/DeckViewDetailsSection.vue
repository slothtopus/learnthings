<script setup lang="ts">
import { computed } from 'vue'

import SectionLayout from '@/views/layouts/SectionLayout.vue'

import LabelledControl from '@/components/ui/LabelledControl.vue'
import { Input } from '@/components/shadcn-ui/input'
import { Label } from '@/components/shadcn-ui/label'

import type { Deck } from '@/lib/Deck'

interface Props {
  deck: Deck
}
const props = defineProps<Props>()

const name = computed({
  get: () => props.deck.name,
  set: (name: string) => {
    props.deck.setName(name)
  }
})
</script>

<template>
  <SectionLayout>
    <template #title>Details</template>
    <template #content>
      <LabelledControl>
        <Label :for="`deck-name-${deck.id}`">Name</Label>
        <Input :id="`deck-name-${deck.id}`" v-model="name" />
      </LabelledControl>
    </template>
  </SectionLayout>
</template>

<style scoped></style>
