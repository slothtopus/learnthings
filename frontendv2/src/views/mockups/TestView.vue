<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '@/components/AppButton.vue'
import ViewToggle from '@/components/ViewToggle.vue'

const toggle = ref('field')
const options = [
  { value: 'field', label: 'Field View', icon: 'view_list' },
  { value: 'card', label: 'Card View', icon: 'grid_view' },
]
</script>

<template>
  <main class="p-16 space-y-12">
    <div v-for="size in ['sm', 'md', 'lg'] as const" :key="size">
      <p class="text-[9px] uppercase tracking-widest text-on-surface-variant mb-4">{{ size }}</p>
      <div class="flex items-center gap-4">
        <AppButton :size="size">Save</AppButton>
        <ViewToggle v-model="toggle" :options="options" :size="size" />
      </div>
    </div>
  </main>
</template>
