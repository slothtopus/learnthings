<script setup lang="ts">
import { computed, inject } from 'vue'
import ProgressBar from 'primevue/progressbar'
import type { ProgressMonitor } from 'core/ObjectManager.js'

const dialogRef = inject<{ value: { data: { progressMonitor: ProgressMonitor } } }>('dialogRef')

const progress = computed(() => {
  if (dialogRef) {
    return dialogRef.value.data.progressMonitor.getProgress()
  } else {
    return undefined
  }
})
</script>

<template>
  <ProgressBar
    :value="progress"
    :show-value="false"
    :pt="{
      value: { style: { transition: 'none' } },
    }"
  >
  </ProgressBar>
</template>

<style scoped></style>
