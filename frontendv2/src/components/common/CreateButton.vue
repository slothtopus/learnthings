<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  label: string
  size?: 'sm' | 'lg'
}>(), {
  icon: 'add_circle',
  size: 'sm',
})
</script>

<template>
  <button
    :class="[
      'w-full border-2 border-dashed border-outline-variant/40 rounded-sm flex items-center justify-center gap-3',
      'text-on-surface/50 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group',
      'cursor-pointer',
      size === 'lg' ? 'flex-col py-10' : 'py-4',
    ]"
  >
    <span
      :class="['material-symbols-outlined group-hover:scale-110 transition-transform', size === 'lg' ? 'text-4xl' : 'text-xl']"
    >{{ icon }}</span>
    <span class="text-[10px] font-bold uppercase tracking-[0.3em]">{{ label }}</span>
  </button>
</template>
