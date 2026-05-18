<script setup lang="ts">
withDefaults(defineProps<{
  icon: string
  variant?: 'ghost' | 'filled' | 'destructive'
  size?: 'sm' | 'md'
}>(), {
  variant: 'ghost',
  size: 'md',
})
</script>

<template>
  <button
    :class="[
      'inline-flex items-center justify-center rounded-xs transition-all duration-200 active:scale-[0.98] cursor-pointer',
      size === 'sm' && 'p-2',
      size === 'md' && 'p-2.5',
      variant === 'ghost' && 'text-on-surface-variant hover:text-primary',
      variant === 'filled' && 'bg-surface-container/50 text-on-surface-variant border border-white/5 hover:bg-surface-container-highest',
      variant === 'destructive' && 'text-on-surface/30 hover:text-error hover:bg-error/10',
    ]"
  >
    <span class="material-symbols-outlined text-xl leading-none">{{ icon }}</span>
  </button>
</template>
