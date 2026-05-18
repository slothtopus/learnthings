<script setup lang="ts">
import { ref } from 'vue'
import AppIconButton from '@/components/used/AppIconButton.vue'
import AppTooltip from '@/components/used/AppTooltip.vue'
import CollapseTransition from '@/components/template-editor/CollapseTransition.vue'

withDefaults(defineProps<{
  icon: string
  label: string
  actionIcon?: string
  active?: boolean
  collapsible?: boolean
  count?: number
  dirty?: boolean
  isDefault?: boolean
}>(), {
  actionIcon: 'more_horiz',
  active: false,
  collapsible: true,
  dirty: false,
  isDefault: false,
})

defineEmits<{ action: [] }>()

const expanded = ref(true)
</script>

<template>
  <div>
    <div
      class="flex items-center justify-between rounded-xs px-2 py-1.5 group"
      :class="[active ? 'bg-surface-container' : 'hover:bg-surface-container', collapsible && 'cursor-pointer']"
      @click="collapsible && (expanded = !expanded)"
    >
      <div class="flex items-center gap-2 min-w-0">
        <span class="material-symbols-outlined text-base leading-none text-on-surface-variant/50 shrink-0">{{ icon }}</span>
        <AppTooltip v-if="dirty" text="Unsaved changes">
          <span class="flex items-center justify-center w-4 h-4 shrink-0">
            <span class="w-1.5 h-1.5 rounded-full bg-primary" />
          </span>
        </AppTooltip>
        <span
          v-if="count !== undefined && count > 0"
          class="text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded-xs bg-surface-container text-on-surface-variant/50 shrink-0"
        >{{ count }}</span>
        <span class="text-sm font-light text-on-surface truncate">{{ label }}</span>
        <span
          v-if="isDefault"
          class="material-symbols-outlined text-sm leading-none text-primary/50 shrink-0"
          style="font-variation-settings: 'FILL' 1"
        >star</span>
      </div>
      <div class="flex items-center">
        <span
          v-if="collapsible"
          class="material-symbols-outlined text-base leading-none text-on-surface-variant/40 transition-transform duration-200"
          :style="expanded ? '' : 'transform: rotate(-90deg)'"
        >expand_more</span>
        <div @click.stop>
          <slot name="action">
            <AppIconButton
              :icon="actionIcon"
              size="sm"
              class="opacity-0 group-hover:opacity-100 transition-opacity"
              @click="$emit('action')"
            />
          </slot>
        </div>
      </div>
    </div>
    <CollapseTransition>
      <div v-if="expanded" class="mt-1 ml-3 border-l border-white/5">
        <slot />
      </div>
    </CollapseTransition>
  </div>
</template>
