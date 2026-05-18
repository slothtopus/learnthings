<script setup lang="ts">
import type { DropdownMenuItemProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { DropdownMenuItem, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"

const props = withDefaults(defineProps<DropdownMenuItemProps & {
  class?: HTMLAttributes["class"]
  inset?: boolean
  variant?: "default" | "destructive"
}>(), {
  variant: "default",
})

const delegatedProps = reactiveOmit(props, "inset", "variant", "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <DropdownMenuItem
    data-slot="dropdown-menu-item"
    :data-inset="inset ? '' : undefined"
    :data-variant="variant"
    v-bind="forwardedProps"
    :class="cn('focus:bg-surface-container-highest focus:text-on-surface data-[variant=destructive]:text-error data-[variant=destructive]:focus:bg-error/10 data-[variant=destructive]:focus:text-error relative flex cursor-pointer items-center gap-2 rounded-xs px-2 py-1.5 text-xs font-light outline-hidden select-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8', props.class)"
  >
    <slot />
  </DropdownMenuItem>
</template>
