<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  arrow?: boolean
}>(), {
  arrow: true,
})
defineEmits<{ click: [] }>()
</script>

<template>
  <button
    class="text-[9px] font-bold uppercase tracking-[0.3em] text-primary hover:text-primary-fixed transition-colors inline-flex items-center gap-1 group cursor-pointer"
    @click="$emit('click')"
  >
    <span class="group-hover:underline underline-offset-2 decoration-primary">{{ label }}</span>
    <span v-if="arrow" class="material-symbols-outlined group-hover:translate-x-0.5 transition-transform" style="font-size: 1.4em; line-height: 1;">arrow_right_alt</span>
  </button>
</template>
