<script setup lang="ts">
import { ref, computed } from 'vue'

import SectionLayout from '@/views/layouts/SectionLayout.vue'

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem
} from '@/components/shadcn-ui/select'
import { Textarea } from '@/components/shadcn-ui/textarea'

import type { CardTemplate } from '@/lib/CardTemplate'

interface Props {
  card: CardTemplate
}
const props = defineProps<Props>()

export type SelectOption = { id: string; value: string }
const SIDES: SelectOption[] = [
  { id: 'front', value: 'Front' },
  { id: 'back', value: 'Back' }
]
const selectedSide = ref<string>('front')

const frontTemplate = computed({
  get: () => props.card.frontTemplate,
  set: (template: string) => props.card.setFrontTemplate(template)
})

const backTemplate = computed({
  get: () => props.card.backTemplate,
  set: (template: string) => props.card.setBackTemplate(template)
})
</script>

<template>
  <SectionLayout>
    <template #title>Templates</template>
    <template #controls>
      <Select v-model="selectedSide">
        <SelectTrigger class="w-[180px]">
          <SelectValue placeholder="Field type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem v-for="side in SIDES" :key="side.id" :value="side.id"
              >{{ side.value }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </template>
    <template #content>
      <Textarea v-if="selectedSide == 'front'" rows="20" v-model="frontTemplate" />
      <Textarea v-else rows="20" v-model="backTemplate" />
    </template>
  </SectionLayout>
</template>

<style scoped></style>
