<script setup lang="ts">
import type { Component } from 'vue'

import { useSheet } from '@/composables/useSheet'

interface Props {
  component?: Component
}
defineProps<Props>()

const { openSheet, closeSheet, sheetComponent } = useSheet()
</script>

<template>
  <Transition name="fade">
    <div v-if="openSheet" class="overlay fixed inset-0" @click.stop="closeSheet">
      <component class="inner" :is="sheetComponent" />
    </div>
  </Transition>
</template>

<style scoped>
.overlay {
  background-color: rgba(0, 0, 0, 0.7);
}

.fade-enter-active,
.fade-leave-active {
  transition: background-color 0.25s;
}

.fade-enter-from.overlay,
.fade-leave-to.overlay {
  background-color: rgba(0, 0, 0, 0);
}

:deep(.inner) {
  position: absolute;
  bottom: 0px;
  left: 50%;
  transform: translate(-50%, 0%);
}

.fade-enter-active > :deep(.inner),
.fade-leave-active > :deep(.inner) {
  transition: transform 0.25s;
}

.fade-leave-to > :deep(.inner),
.fade-enter-from > :deep(.inner) {
  transform: translate(-50%, 100%);
}
</style>
