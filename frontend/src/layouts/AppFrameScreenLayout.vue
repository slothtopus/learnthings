<script setup lang="ts">
import AppFrameBaseLayout from './AppFrameBaseLayout.vue'

interface Props {
  noPadding?: boolean
  fullWidth?: boolean
  title?: string
  breadcrumbs: { icon?: string; label: string; route?: string }[]
}
defineProps<Props>()
</script>

<template>
  <AppFrameBaseLayout :breadcrumbs="breadcrumbs">
    <div class="w-full h-full relative overflow-y-auto">
      <div
        class="absolute min-h-128 top-0 bottom-0 left-1/2 w-full -translate-x-1/2"
        :class="{ 'p-4 pt-8': !noPadding, 'max-w-6xl': !fullWidth }"
      >
        <div class="h-full w-full flex flex-col gap-4">
          <div v-if="title !== undefined" class="flex w-full px-4 items-center">
            <h2 class="w-full text-xl sm:text-2xl font-thin text-white">{{ title }}</h2>
            <slot name="controls"></slot>
          </div>
          <slot name="content"></slot>
        </div>
      </div>
    </div>
  </AppFrameBaseLayout>
</template>

<style scoped></style>
