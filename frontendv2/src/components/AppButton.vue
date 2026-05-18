<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
  iconFilled?: boolean
  disabled?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  iconFilled: false,
  disabled: false,
})
</script>

<template>
  <button
    :disabled="disabled"
    :class="[
      'inline-flex items-center justify-center gap-2 font-bold uppercase tracking-widest rounded-xs transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none cursor-pointer disabled:cursor-unset',
      // Size
      size === 'sm' && 'text-[9px] px-4 h-8',
      size === 'md' && 'text-[10px] px-6 h-10',
      size === 'lg' && 'text-[11px] px-10 h-12',
      // Variant
      variant === 'primary' && !disabled && 'btn-glow bg-primary text-on-primary hover:brightness-110',
      variant === 'primary' && disabled && 'bg-primary/30 text-on-primary/30',
      variant === 'secondary' && 'border border-white/10 text-on-surface hover:bg-white/5',
      variant === 'ghost' && 'text-on-surface-variant hover:text-on-surface',
    ]"
  >
    <span
      v-if="icon"
      :class="['material-symbols-outlined leading-none', size === 'lg' ? 'text-lg' : 'text-sm']"
      :style="iconFilled ? { fontVariationSettings: `'FILL' 1` } : undefined"
    >{{ icon }}</span>
    <slot />
  </button>
</template>
