<script setup lang="ts">
import { computed } from 'vue'

import SectionLayout from '@/views/layouts/SectionLayout.vue'

import LabelledControl from '@/components/ui/LabelledControl.vue'
import { Input } from '@/components/shadcn-ui/input'
import { Label } from '@/components/shadcn-ui/label'

import type { CardTemplate } from '@/lib/CardTemplate'

interface Props {
  card: CardTemplate
}
const props = defineProps<Props>()

const name = computed({
  get: () => props.card.name,
  set: (name: string) => {
    props.card.setName(name)
  }
})
</script>

<template>
  <SectionLayout>
    <template #title>Details</template>
    <template #content>
      <LabelledControl>
        <Label :for="`card-name-${card.id}`">Name</Label>
        <Input :id="`card-name-${card.id}`" v-model="name" />
      </LabelledControl>
    </template>
  </SectionLayout>
</template>

<style scoped></style>
