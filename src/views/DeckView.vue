<script setup lang="ts">
import MasterLayout from './MasterLayout.vue'
import SectionLayout from './SectionLayout.vue'

import LtNoteType from '@/components/LtNoteType.vue'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

import type { Deck } from '@/lib/Deck'
import { computed } from 'vue'

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
  <MasterLayout>
    <template #title>Deck: {{ deck.name }}</template>
    <template #content>
      <SectionLayout>
        <template #title>Deck info</template>
        <template #content>
          <div class="flex flex-col gap-2">
            <Label for="deck-name">Name</Label>
            <Input id="deck-name" type="text" v-model="name" />
          </div>
        </template>
      </SectionLayout>
      <SectionLayout>
        <template #title>Note types</template>
        <template #controls><Button @click="deck.createNewNoteType()">Create new</Button></template>
        <template #content>
          <LtNoteType v-for="noteType in deck.noteTypes" :key="noteType.id"
            >Note type one</LtNoteType
          >
        </template>
      </SectionLayout>
    </template>
  </MasterLayout>
</template>

<style scoped></style>
