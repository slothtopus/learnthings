<script setup lang="ts">
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import type { TooltipContentProps } from 'reka-ui'

defineProps<{
  text: string
  side?: TooltipContentProps['side']
}>()
</script>

<template>
  <Tooltip>
    <TooltipTrigger as-child>
      <slot />
    </TooltipTrigger>
    <TooltipContent :side="side">
      {{ text }}
    </TooltipContent>
  </Tooltip>
</template>
