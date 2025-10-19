<script setup lang="ts">
import { Button } from 'primevue'
import { useConfirmationData } from '@/composables/useConfirmationDialog'

const { data, handleYes, handleNo } = useConfirmationData()
</script>

<template>
  <div>
    <p>{{ data.message }}</p>
    <div class="mt-6 flex gap-4 justify-end">
      <Button label="Yes" size="small" @click="handleYes" />
      <Button label="No" size="small" severity="secondary" @click="handleNo" />
    </div>
  </div>
</template>

<style scoped></style>
