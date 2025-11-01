<script setup lang="ts">
import { Button } from 'primevue'

interface Props {
  title: string
  icon?: string
}
defineProps<Props>()

defineEmits(['clicked'])
</script>

<template>
  <section>
    <div class="flex gap-2 items-center px-2 mb-1 border-b-1 border-gray-700">
      <h2 class="w-full truncate">{{ title }}</h2>
      <Button :class="{'invisible': icon === undefined}" text :icon="icon ?? 'pi pi-plus'" @click.stop="$emit('clicked')" />
    </div>
    <slot></slot>
  </section>
</template>

<style scoped></style>
