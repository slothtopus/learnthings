<script setup lang="ts">
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem
} from '@/components/shadcn-ui/select'
import { cn } from '@/lib/shadcn-utils'

import type { SelectOption } from './ui.types'

interface Props {
  options: SelectOption[]
  modelValue?: SelectOption
  placeholder?: string
  class?: string
}
const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [option?: SelectOption]
}>()

const handleUpdateModelValue = (id: string) => {
  emit(
    'update:modelValue',
    props.options.find((o) => o.id == id)
  )
}
</script>

<template>
  <Select :modelValue="modelValue?.id" @update:modelValue="handleUpdateModelValue">
    <SelectTrigger :class="cn('w-[180px]', props.class)">
      <SelectValue :placeholder="placeholder" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem v-for="option in options" :key="option.id" :value="option.id"
          >{{ option.value }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>

<style scoped></style>
