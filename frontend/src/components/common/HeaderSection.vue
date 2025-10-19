<script setup lang="ts">
interface Props {
  title?: string
}
defineProps<Props>()
</script>

<template>
  <div
    class="h-19 flex w-full px-4 py-4 mt-4 -mb-8 items-center bg-neutral-100 dark:bg-neutral-900 sticky top-0 z-1 border-solid border-y-0 border-2 border-neutral-100 dark:border-neutral-900 box-content!"
  >
    <slot name="title">
      <h2 class="w-full sm:text-2xl text-xl font-thin text-white">{{ title }}</h2>
    </slot>
    <slot name="controls"></slot>
  </div>
</template>

<style scoped></style>
