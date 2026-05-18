<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  placeholder?: string
  modelValue?: string
  multiline?: boolean
  rows?: number
  icon?: string
  size?: 'sm' | 'md' | 'lg'
}>(), {
  rows: 2,
  multiline: false,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="space-y-3">
    <label v-if="label" class="block text-[10px] font-light uppercase tracking-[0.3em] text-on-surface-variant">
      {{ label }}
    </label>
    <div class="relative">
      <span
        v-if="icon"
        :class="[
          'material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40',
          size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base',
        ]"
      >{{ icon }}</span>
      <textarea
        v-if="multiline"
        :rows="rows"
        :placeholder="placeholder"
        :value="modelValue"
        class="w-full bg-surface-container-lowest border border-outline-variant/20 focus:border-primary/50 text-on-surface placeholder:text-on-surface/30 rounded-sm transition-all outline-none resize-none text-sm py-4"
        :class="icon ? 'pl-12 pr-4' : 'px-4'"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      />
      <input
        v-else
        :placeholder="placeholder"
        :value="modelValue"
        type="text"
        class="w-full bg-surface-container-lowest border border-outline-variant/20 focus:border-primary/50 text-on-surface placeholder:text-on-surface/30 rounded-sm transition-all outline-none text-sm"
        :class="[
          icon ? 'pl-12 pr-6' : 'px-4',
          size === 'sm' ? 'h-8' : size === 'md' ? 'h-10' : size === 'lg' ? 'h-12' : 'py-4',
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>
