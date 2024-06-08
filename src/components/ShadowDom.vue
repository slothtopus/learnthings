<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface Props {
  html: string
  css: string
}
const props = defineProps<Props>()

const shadowElement = ref<HTMLDivElement | null>(null)
let shadow: ShadowRoot
const sheet = new CSSStyleSheet()
onMounted(() => {
  if (shadowElement.value !== null) {
    shadow = shadowElement.value.attachShadow({ mode: 'open' })
    sheet.replaceSync(props.css)
    shadow.innerHTML = props.html
    shadow.adoptedStyleSheets = [sheet]
  }
})

watch(
  () => props.html,
  () => {
    shadow.innerHTML = props.html
  }
)

watch(
  () => props.css,
  () => {
    sheet.replaceSync(props.css)
  }
)
</script>

<template>
  <div ref="shadowElement"></div>
</template>

<style scoped></style>
