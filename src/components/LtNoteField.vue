<script setup lang="ts">
import { computed } from 'vue'

import StackCard from '@/components/ui/StackCard.vue'

import { Input } from '@/components/shadcn-ui/input'
import { Label } from '@/components/shadcn-ui/label'

import LabelledControl from '@/components/ui/LabelledControl.vue'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem
} from '@/components/shadcn-ui/select'
import { Button } from '@/components/shadcn-ui/button'

import type { NoteField } from '@/lib/NoteField'

interface Props {
  field: NoteField
}
const props = defineProps<Props>()

const name = computed({
  get: () => props.field.name,
  set: (name: string) => props.field.setName(name)
})

const mimeType = computed({
  get: () => props.field.mimeType,
  set: (mimeType: string) => props.field.setMimeType(mimeType)
})

defineEmits<{
  delete: [value: void]
}>()
</script>

<template>
  <StackCard>
    <div class="flex gap-3 flex-col items-start lg:flex-row lg:items-end">
      <LabelledControl>
        <Label :for="`field-name-${field.id}`">Field name</Label>
        <Input :id="`field-name-${field.id}`" v-model="name" />
      </LabelledControl>
      <LabelledControl class="w-auto">
        <Label :for="`mime-type-${field.id}`">Field type</Label>
        <Select v-model="mimeType">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Field type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="mimeType in field.mimeTypes" :key="mimeType" :value="mimeType"
                >{{ mimeType }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </LabelledControl>
    </div>
    <template #controls>
      <Button variant="secondary" @click="$emit('delete')">Delete</Button>
    </template>
  </StackCard>
</template>

<style scoped></style>
@/lib/NoteFieldTemplate
