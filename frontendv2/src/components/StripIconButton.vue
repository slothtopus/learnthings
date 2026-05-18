<script setup lang="ts">
withDefaults(defineProps<{
  icon: string
  variant?: 'default' | 'destructive'
}>(), {
  variant: 'default',
})
</script>

<template>
  <button
    :class="[
      'flex-1 w-full flex items-center justify-center transition-colors text-on-surface/40',
      variant === 'default' && 'hover:bg-primary/10 hover:text-primary',
      variant === 'destructive' && 'hover:bg-error/10 hover:text-error',
    ]"
  >
    <span class="material-symbols-outlined text-lg leading-none">{{ icon }}</span>
  </button>
</template>
