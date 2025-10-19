<script setup lang="ts">
interface Props {
  label: string
  id: string
}
defineProps<Props>()
</script>

<template>
  <div class="flex flex-col">
    <label :for="id" class="font-thin block mb-2">{{ label }}</label>
    <slot></slot>
  </div>
</template>

<style scoped></style>
