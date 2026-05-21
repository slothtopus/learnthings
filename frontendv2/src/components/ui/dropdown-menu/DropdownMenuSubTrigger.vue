<script setup lang="ts">
import type { DropdownMenuSubTriggerProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  DropdownMenuSubTrigger,
  useForwardProps,
} from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<DropdownMenuSubTriggerProps & { class?: HTMLAttributes["class"], inset?: boolean }>()

const delegatedProps = reactiveOmit(props, "class", "inset")
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <DropdownMenuSubTrigger
    data-slot="dropdown-menu-sub-trigger"
    v-bind="forwardedProps"
    :data-inset="inset ? '' : undefined"
    :class="cn(
      'focus:bg-surface-container-highest focus:text-on-surface data-[state=open]:bg-surface-container-highest data-[state=open]:text-on-surface relative flex cursor-pointer items-center gap-2 rounded-xs px-2 py-1.5 text-xs font-light outline-hidden select-none data-[inset]:pl-8',
      props.class,
    )"
  >
    <slot />
    <span class="material-symbols-outlined text-sm leading-none ml-auto">chevron_right</span>
  </DropdownMenuSubTrigger>
</template>
