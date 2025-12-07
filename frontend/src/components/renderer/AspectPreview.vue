<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

import { nanoid } from 'nanoid'

import type { RenderedCard } from 'core/CardTemplate.js'

interface Props {
  previewWidth: number
  previewHeight: number
  card: RenderedCard
  widgetSettings?: Record<string, any>
  align?: 'left' | 'right'
}
const props = defineProps<Props>()

const previewElement = ref<HTMLDivElement | null>(null)

const className = `preview-${nanoid(6)}`
const styleElem = document.createElement('style')
document.head.appendChild(styleElem)
styleElem.appendChild(document.createTextNode(''))
const addContainerQuery = (width: number, height: number) => {
  const css = `
        .${className} {
            width: 100%;
            overflow: hidden;
        }

        @container (min-aspect-ratio: ${width}/${height}) {
            .${className} {
                height: 100%;
                width: auto;
            }
        }
    `
  styleElem.textContent = css
}

const removeContainerQuery = () => {
  document.head.removeChild(styleElem)
}

watch(
  [() => props.previewWidth, () => props.previewHeight],
  () => {
    addContainerQuery(props.previewWidth, props.previewHeight)
  },
  { immediate: true },
)

onMounted(() => {
  //addContainerQuery(props.previewWidth, props.previewHeight)
  if (previewElement.value !== null) {
    const ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const firstEntry = entries[0]
      if (firstEntry) {
        scaleRatio.value = firstEntry.contentBoxSize[0].inlineSize / props.previewWidth
      }
    })
    ro.observe(previewElement.value)
  }
})

onBeforeUnmount(() => {
  removeContainerQuery()
})
const scaleRatio = ref(0)

const scaleStyle = computed(() => ({
  width: `${props.previewWidth}px`,
  height: `${props.previewHeight}px`,
  transform: `scale(${scaleRatio.value})`

}) )
</script>

<template>
  <div class="preview-outer justify-center relative h-full">
    <div class="preview-wrapper" :class="align">
      <div
        ref="previewElement"
        class="rounded-md border border-gray-500"
        :class="className"
        :style="`aspect-ratio: ${previewWidth} / ${previewHeight}`"
      >
      <slot :scaleStyle="scaleStyle"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-wrapper {
  position: absolute;
  inset: 0;
  container-type: size;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-wrapper.right {
  justify-content: flex-end;
}
.preview-wrapper.left {
  justify-content: flex-start;
}
</style>
