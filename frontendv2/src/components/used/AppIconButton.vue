<script setup lang="ts">
withDefaults(defineProps<{
  icon: string
  variant?: 'ghost' | 'filled' | 'destructive'
  size?: 'xs' | 'sm' | 'md'
}>(), {
  variant: 'ghost',
  size: 'md',
})
</script>

<template>
  <button
    :class="[
      'inline-flex items-center justify-center rounded-xs transition-all duration-200 active:scale-[0.98] cursor-pointer',
      size === 'xs' && 'p-0.5',
      size === 'sm' && 'p-2',
      size === 'md' && 'p-2.5',
      variant === 'ghost' && 'text-on-surface-variant hover:text-primary',
      variant === 'filled' && 'bg-surface-container/50 text-on-surface-variant border border-white/5 hover:bg-surface-container-highest',
      variant === 'destructive' && 'text-on-surface/30 hover:text-error hover:bg-error/10',
    ]"
  >
    <span :class="['material-symbols-outlined leading-none', size === 'xs' ? 'text-sm' : 'text-xl']">{{ icon }}</span>
  </button>
</template>
