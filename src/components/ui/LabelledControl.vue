<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/shadcn-utils'

interface Props {
  class?: HTMLAttributes['class']
}
const props = defineProps<Props>()
</script>

<template>
  <div :class="cn('w-full flex flex-col gap-2', props.class)"><slot></slot></div>
</template>
