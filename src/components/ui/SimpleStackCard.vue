<script setup lang="ts">
import { Grip } from 'lucide-vue-next'
</script>

<template>
  <div
    class="first:rounded-t-lg first:border border-x border-b last:rounded-b-lg bg-card text-card-foreground p-4 flex items-center gap-3"
  >
    <Grip class="drag-handle" />
    <span class="mr-auto whitespace-nowrap text-ellipsis overflow-hidden">
      <slot></slot>
    </span>
    <slot name="controls"> </slot>
  </div>
</template>

<style scoped>
.drag-handle {
  cursor: move;
}
</style>
