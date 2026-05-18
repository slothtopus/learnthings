<script setup lang="ts">
import { ref } from 'vue'
import AppIconButton from '@/components/AppIconButton.vue'
import CollapseTransition from '@/components/CollapseTransition.vue'

withDefaults(defineProps<{
  icon: string
  label: string
  actionIcon?: string
  active?: boolean
}>(), {
  actionIcon: 'more_horiz',
  active: false,
})

const expanded = ref(true)
</script>

<template>
  <div>
    <div
      class="flex items-center justify-between rounded-xs px-2 py-1.5 group cursor-pointer"
      :class="active ? 'bg-surface-container' : 'hover:bg-surface-container'"
      @click="expanded = !expanded"
    >
      <div class="flex items-center gap-2 min-w-0">
        <span class="material-symbols-outlined text-base leading-none text-on-surface-variant/50 shrink-0">{{ icon }}</span>
        <span class="text-sm font-light text-on-surface truncate">{{ label }}</span>
      </div>
      <div class="flex items-center">
        <span
          class="material-symbols-outlined text-base leading-none text-on-surface-variant/40 transition-transform duration-200"
          :style="expanded ? '' : 'transform: rotate(-90deg)'"
        >expand_more</span>
        <div @click.stop>
          <slot name="action">
            <AppIconButton
              :icon="actionIcon"
              size="sm"
              class="opacity-0 group-hover:opacity-100 transition-opacity"
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
