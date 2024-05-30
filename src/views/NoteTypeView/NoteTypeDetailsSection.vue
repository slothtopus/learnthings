<script setup lang="ts">
import { computed } from 'vue'

import SectionLayout from '@/views/layouts/SectionLayout.vue'

import LabelledControl from '@/components/ui/LabelledControl.vue'
import { Input } from '@/components/shadcn-ui/input'
import { Label } from '@/components/shadcn-ui/label'

import type { NoteType } from '@/lib/NoteType'

interface Props {
  noteType: NoteType
}
const props = defineProps<Props>()

const name = computed({
  get: () => props.noteType.name,
  set: (name: string) => {
    props.noteType.setName(name)
  }
})
</script>

<template>
  <SectionLayout>
    <template #title>Details</template>
    <template #content>
      <LabelledControl>
        <Label :for="`notetype-name-${noteType.id}`">Name</Label>
        <Input :id="`notetype-name-${noteType.id}`" v-model="name" />
      </LabelledControl>
    </template>
  </SectionLayout>
</template>

<style scoped></style>
