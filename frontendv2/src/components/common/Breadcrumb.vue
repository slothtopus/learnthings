<script setup lang="ts">
defineProps<{
  items: { label: string; href?: string }[]
}>()
</script>

<template>
  <nav class="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
    <template v-for="(item, i) in items" :key="item.label">
      <RouterLink
        v-if="item.href"
        :to="item.href"
        class="hover:text-primary transition-colors duration-200"
      >{{ item.label }}</RouterLink>
      <span v-else class="text-on-surface">{{ item.label }}</span>
      <span v-if="i < items.length - 1" class="material-symbols-outlined text-xs">chevron_right</span>
    </template>
  </nav>
</template>
