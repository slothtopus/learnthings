<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  description: string
  selected: boolean
}>()

defineEmits<{ select: [] }>()
</script>

<template>
  <button
    class="w-full flex items-center gap-4 p-4 rounded-sm border transition-all duration-200 text-left cursor-pointer"
    :class="
      selected
        ? 'bg-primary/10 border-primary/40 text-primary'
        : 'bg-surface-container-high border-outline-variant/10 hover:border-primary/20 text-on-surface'
    "
    @click="$emit('select')"
  >
    <!-- Icon -->
    <div
      class="w-10 h-10 rounded-xs flex items-center justify-center shrink-0 transition-colors"
      :class="selected ? 'bg-primary/20' : 'bg-surface-container-lowest'"
    >
      <span class="material-symbols-outlined text-lg leading-none">{{ icon }}</span>
    </div>

    <!-- Label & description -->
    <div class="flex-1 min-w-0">
      <p
        class="text-[10px] font-bold uppercase tracking-widest mb-0.5 transition-colors"
        :class="selected ? 'text-primary' : 'text-on-surface-variant'"
      >
        {{ label }}
      </p>
      <p
        class="text-xs font-light leading-relaxed transition-colors"
        :class="selected ? 'text-primary/70' : 'text-on-surface/50'"
      >
        {{ description }}
      </p>
    </div>

    <!-- Selected indicator -->
    <div
      class="w-4 h-4 rounded-full border-2 shrink-0 transition-all"
      :class="selected ? 'border-primary bg-primary/30' : 'border-on-surface/20'"
    />
  </button>
</template>
