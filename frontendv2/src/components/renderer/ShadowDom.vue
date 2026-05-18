<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { widgetsCss } from './widgets/widgetsCss'

interface Props {
  css?: string
}
const props = withDefaults(defineProps<Props>(), { css: '' })

const hostEl = ref<HTMLElement | null>(null)
const containerEl = ref<HTMLElement | null>(null)

let widgetSheet: CSSStyleSheet | null = null
let userSheet: CSSStyleSheet | null = null

const updateWidgetCSS = (css: string) => {
  if (!widgetSheet) widgetSheet = new CSSStyleSheet()
  widgetSheet.replaceSync(css)
  return widgetSheet
}

const updateUserCSS = (css: string) => {
  if (!userSheet) userSheet = new CSSStyleSheet()
  userSheet.replaceSync(css)
  return userSheet
}

onMounted(() => {
  if (!hostEl.value) return
  const shadow = hostEl.value.attachShadow({ mode: 'open' })

  const container = document.createElement('main')
  container.id = 'root'
  shadow.appendChild(container)

  shadow.adoptedStyleSheets = [updateWidgetCSS(widgetsCss), updateUserCSS(props.css)]
  containerEl.value = container
})

watch(
  () => props.css,
  (css) => updateUserCSS(css ?? ''),
  { flush: 'post' },
)

onBeforeUnmount(() => {
  containerEl.value?.remove()
  containerEl.value = null
})
</script>

<template>
  <span ref="hostEl" style="display: contents; all: initial" />
  <teleport v-if="containerEl" :to="containerEl">
    <slot />
  </teleport>
</template>
