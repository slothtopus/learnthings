<script setup lang="ts">
export interface ToggleOption {
  value: string
  label: string
  icon: string
}

withDefaults(defineProps<{
  modelValue: string
  options: ToggleOption[]
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'sm',
})

defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <div class="flex rounded-xs p-1 bg-surface-container-lowest">
    <button
      v-for="option in options"
      :key="option.value"
      :class="[
        'flex items-center gap-2 rounded-xs font-bold uppercase tracking-[0.2em] transition-all',
        size === 'sm' && 'text-[9px] px-4 h-6',
        size === 'md' && 'text-[10px] px-6 h-8',
        size === 'lg' && 'text-[11px] px-10 h-10',
        modelValue === option.value ? 'bg-surface-container text-primary' : 'text-on-surface/40 hover:text-on-surface',
      ]"
      @click="$emit('update:modelValue', option.value)"
    >
      <span :class="['material-symbols-outlined', size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg']">{{ option.icon }}</span>
      {{ option.label }}
    </button>
  </div>
</template>
