<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  width?: number
  height?: number
}
const props = withDefaults(defineProps<Props>(), {
  width: 1280,
  height: 720,
})

const containerEl = ref<HTMLElement | null>(null)
const containerW = ref(0)
const containerH = ref(0)
let ro: ResizeObserver | null = null

onMounted(() => {
  if (!containerEl.value) return
  ro = new ResizeObserver(([entry]) => {
    const box = entry.contentBoxSize[0]
    containerW.value = box.inlineSize
    containerH.value = box.blockSize
  })
  ro.observe(containerEl.value)
})

onBeforeUnmount(() => ro?.disconnect())

// Scale to fit both dimensions while preserving aspect ratio
const scale = computed(() => {
  if (!containerW.value || !containerH.value) return 0
  return Math.min(containerW.value / props.width, containerH.value / props.height)
})

// Center the scaled content in the container
const innerStyle = computed(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`,
  transform: `scale(${scale.value})`,
  transformOrigin: 'top left',
  position: 'absolute' as const,
  left: `${(containerW.value - props.width * scale.value) / 2}px`,
  top: `${(containerH.value - props.height * scale.value) / 2}px`,
}))
</script>

<template>
  <div ref="containerEl" style="position: relative; width: 100%; height: 100%; overflow: hidden;">
    <div v-if="scale > 0" :style="innerStyle">
      <slot />
    </div>
  </div>
</template>
