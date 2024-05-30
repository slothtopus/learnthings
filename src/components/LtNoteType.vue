<script setup lang="ts">
import { Button } from '@/components/shadcn-ui/button'

import SimpleStackCard from '@/components/ui/SimpleStackCard.vue'

defineEmits<{
  edit: [value: void]
  delete: [value: void]
}>()
</script>

<template>
  <SimpleStackCard>
    <slot></slot>
    <template #controls>
      <Button variant="outline" @click="$emit('edit')">Edit</Button>
      <Button variant="outline" @click="$emit('delete')">Delete</Button>
    </template>
  </SimpleStackCard>
</template>

<style scoped></style>
