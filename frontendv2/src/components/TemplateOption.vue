<script setup lang="ts">
defineProps<{
  title: string
  description: string
  selected: boolean
}>()

defineEmits<{
  select: []
}>()
</script>

<template>
  <button
    :class="[
      'flex items-start gap-4 p-4 rounded-sm text-left transition-all duration-200',
      'bg-surface-container-lowest border hover:bg-surface-container-high',
      selected ? 'border-primary/40' : 'border-transparent hover:border-outline-variant/20',
    ]"
    @click="$emit('select')"
  >
    <!-- Radio indicator -->
    <div class="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
      :class="selected ? 'border-primary' : 'border-outline-variant/30'"
    >
      <div v-if="selected" class="w-2.5 h-2.5 rounded-full bg-primary" />
    </div>

    <div>
      <h4 class="text-sm font-bold text-on-surface">{{ title }}</h4>
      <p class="text-xs text-on-surface-variant mt-1">{{ description }}</p>
    </div>
  </button>
</template>
