<script setup lang="ts">
import { computed } from 'vue'

import StackCard from '@/components/ui/StackCard.vue'

import { Input } from '@/components/shadcn-ui/input'
import { Label } from '@/components/shadcn-ui/label'

import LabelledControl from '@/components/ui/LabelledControl.vue'
import { Button } from '@/components/shadcn-ui/button'

import type { CardTemplate } from '@/lib/CardTemplate'

interface Props {
  card: CardTemplate
}
const props = defineProps<Props>()

const name = computed({
  get: () => props.card.name,
  set: (name: string) => props.card.setName(name)
})

defineEmits<{
  edit: [value: void]
  delete: [value: void]
}>()
</script>

<template>
  <StackCard>
    <div class="flex gap-3 flex-col items-start lg:flex-row lg:items-end">
      <LabelledControl>
        <Label :for="`card-template-name-${card.id}`">Card template name</Label>
        <Input :id="`card-template-name-${card.id}`" v-model="name" />
      </LabelledControl>
    </div>
    <template #controls>
      <Button variant="secondary" @click="$emit('edit')">Edit</Button>
      <Button variant="secondary" @click="$emit('delete')">Delete</Button>
    </template>
  </StackCard>
</template>

<style scoped></style>
