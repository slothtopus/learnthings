<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

interface Props {
  route: RouteLocationRaw
}
defineProps<Props>()
</script>

<template>
  <div
    class="flex items-center py-2 px-1"
    :class="{ 'hover:text-slate-200 cursor-pointer': route !== undefined }"
    @click="$router.push(route)"
  >
    <slot></slot>
  </div>
</template>

<style scoped></style>
