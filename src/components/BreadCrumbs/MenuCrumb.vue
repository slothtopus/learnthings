<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'
import type { SelectOption } from '@/components/ui/ui.types'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/shadcn-ui/dropdown-menu'

interface Props {
  name: string
  options: SelectOption[]
}
defineProps<Props>()

defineEmits<{
  select: [id: string]
}>()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger class="flex items-center py-2 px-1 hover:text-slate-200 cursor-pointer"
      ><slot></slot> <ChevronDown class="h-5"
    /></DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>{{ name }} </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        v-for="option in options"
        :key="option.id"
        @click="$emit('select', option.id)"
        >{{ option.value }}</DropdownMenuItem
      >
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<style scoped></style>
