<script setup lang="ts">
withDefaults(defineProps<{
  icon: string
  variant?: 'ghost' | 'filled' | 'destructive'
  size?: 'xs' | 'sm' | 'md'
  disabled?: boolean
}>(), {
  variant: 'ghost',
  size: 'md',
  disabled: false,
})
</script>

<template>
  <button
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center rounded-xs transition-all duration-200 active:scale-[0.98]',
      disabled ? 'opacity-30 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
      size === 'xs' && 'p-0.5',
      size === 'sm' && 'p-2',
      size === 'md' && 'p-2.5',
      !disabled && variant === 'ghost' && 'text-on-surface-variant hover:text-primary hover:bg-primary/10',
      !disabled && variant === 'filled' && 'bg-surface-container/50 text-on-surface-variant border border-white/5 hover:bg-surface-container-highest',
      !disabled && variant === 'destructive' && 'text-on-surface/30 hover:text-error hover:bg-error/10',
      disabled && 'text-on-surface-variant',
    ]"
  >
    <span :class="['material-symbols-outlined leading-none', size === 'xs' ? 'text-sm' : 'text-xl']">{{ icon }}</span>
  </button>
</template>
