<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

import { nanoid } from 'nanoid'

import ShadowDom from './ShadowDom.vue'

interface Props {
  previewWidth: number
  previewHeight: number
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
            background-color: beige;
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
  { immediate: true }
)

onMounted(() => {
  addContainerQuery(props.previewWidth, props.previewHeight)
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
</script>

<template>
  <div class="preview-outer justify-center relative h-full">
    <div class="preview-wrapper">
      <div
        ref="previewElement"
        :class="className"
        :style="`aspect-ratio: ${previewWidth} / ${previewHeight}`"
      >
        <ShadowDom
          class="content flex flex-col justify-center items-center"
          :style="`width: ${previewWidth}px; height: ${previewHeight}px; transform: scale(${scaleRatio})`"
          html="<h1>HELLO</h1>"
          css=":root { display: flex; justify-content: center; align-items: center}"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-outer {
  min-height: 24rem;
}

.preview-wrapper {
  position: absolute;
  inset: 0;
  outline: 1px solid blue;
  container-type: size;
  display: flex;
  justify-content: center;
  align-items: center;
}

.desktop {
  width: 100%;
  background-color: beige;
  overflow: hidden;
}

.content {
  transform-origin: top left;
}

h1 {
  font-size: 3rem;
}

h1:hover {
  color: red;
}
</style>
