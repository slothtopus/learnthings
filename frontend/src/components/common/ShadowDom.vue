<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface Props {
  html: string
  css: string
  element?: string
}
const props = defineProps<Props>()

const shadowElement = ref<HTMLDivElement | null>(null)
let shadow: ShadowRoot
const containerElement = window.document.createElement(props.element || 'main')
containerElement.id = 'root'
const sheet = new CSSStyleSheet()

onMounted(() => {
  if (shadowElement.value !== null) {
    shadow = shadowElement.value.attachShadow({ mode: 'closed' })
    sheet.replaceSync(props.css)
    shadow.appendChild(containerElement)
    containerElement.innerHTML = props.html
    shadow.adoptedStyleSheets = [sheet]
  }
})

watch(
  () => props.html,
  () => {
    containerElement.innerHTML = props.html
  },
)

watch(
  () => props.css,
  () => {
    sheet.replaceSync(props.css)
  },
)
</script>

<template>
  <div ref="shadowElement"></div>
</template>

<style scoped></style>
