<script setup lang="ts">
import { Grip } from 'lucide-vue-next'
</script>

<template>
  <div
    class="first:rounded-t-lg first:border border-x border-b last:rounded-b-lg bg-card text-card-foreground p-4 flex items-center gap-3"
  >
    <Grip class="drag-handle" />
    <div class="grow whitespace-nowrap flex flex-col">
      <slot></slot>
    </div>
    <div class="flex flex-col mt-auto gap-3">
      <slot name="controls"> </slot>
    </div>
  </div>
</template>

<style scoped>
.drag-handle {
  cursor: move;
}
</style>
