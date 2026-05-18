<script setup lang="ts">
import { TooltipContent, TooltipPortal } from 'reka-ui'
import type { TooltipContentProps } from 'reka-ui'
import { cn } from '@/lib/utils'

interface Props extends TooltipContentProps {
  class?: string
}
const props = withDefaults(defineProps<Props>(), {
  sideOffset: 6,
  avoidCollisions: true,
  collisionPadding: 8,
})
</script>

<template>
  <TooltipPortal>
    <TooltipContent
      v-bind="props"
      :class="cn(
        'z-50 whitespace-nowrap rounded-xs border border-white/10 bg-surface-container-highest px-2 py-1',
        'text-[9px] font-bold uppercase tracking-widest text-on-surface-variant',
        'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=delayed-open]:zoom-in-95',
        'data-[side=top]:slide-in-from-bottom-1 data-[side=bottom]:slide-in-from-top-1',
        'data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1',
        props.class,
      )"
    >
      <slot />
    </TooltipContent>
  </TooltipPortal>
</template>
