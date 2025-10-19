<script setup lang="ts">
import AppFrameBaseLayout from './AppFrameBaseLayout.vue'

interface Props {
  breadcrumbs: { icon?: string; label: string; route?: string }[]
}
defineProps<Props>()
</script>

<template>
  <AppFrameBaseLayout :breadcrumbs="breadcrumbs">
    <div class="w-full h-full overflow-y-auto">
      <div class="px-8 pb-8 flex flex-col gap-8 items-center w-full mx-auto max-w-4xl">
        <slot name="content"></slot>
      </div>
    </div>
  </AppFrameBaseLayout>
</template>

<style scoped></style>
