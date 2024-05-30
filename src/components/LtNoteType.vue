<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <div
    class="first:rounded-t-lg first:border border-x border-b last:rounded-b-lg bg-card text-card-foreground p-4 flex items-center gap-3"
  >
    <span class="mr-auto whitespace-nowrap text-ellipsis overflow-hidden">
      <slot></slot>
    </span>
    <Button variant="outline">Edit</Button>
    <Button variant="outline">Delete</Button>
  </div>
</template>

<style scoped></style>
