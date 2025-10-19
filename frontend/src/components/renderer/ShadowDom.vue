<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import widgetsCssRaw from './widgets/css/widgets.build.css?raw' // Vite will build & watch this

type ShadowMode = 'open' | 'closed'

interface Props {
  mode?: ShadowMode
  delegatesFocus?: boolean
  className?: string
  css?: string // <- custom CSS to inject into the shadow root
}
const props = withDefaults(defineProps<Props>(), {
  mode: 'closed',
  delegatesFocus: false,
  className: '',
  css: '',
})

const hostEl = ref<HTMLElement | null>(null)
const containerEl = ref<HTMLElement | null>(null)

//let widgetsLinkEl: HTMLLinkElement | null = null
let widgetSheet: CSSStyleSheet | null = null
let userSheet: CSSStyleSheet | null = null

const updateWidgetCSS = (css: string) => {
  if (widgetSheet === null) {
    widgetSheet = new CSSStyleSheet()
  }
  //#console.log('updating widget CSS', css)
  widgetSheet.replaceSync(css)
  return widgetSheet
}

const updateUserCSS = (css: string) => {
  if (userSheet === null) {
    userSheet = new CSSStyleSheet()
  }
  console.log('updating user css', css)
  userSheet.replaceSync(css)
  return userSheet
}

onMounted(() => {
  if (!hostEl.value) return
  const shadow = hostEl.value.attachShadow({
    mode: props.mode,
    delegatesFocus: props.delegatesFocus,
  })

  const container = document.createElement('main')
  container.id = 'root'
  if (props.className) container.className = props.className
  shadow.appendChild(container)

  const widgetSheet = updateWidgetCSS(widgetsCssRaw)
  const userSheet = updateUserCSS(props.css)
  shadow.adoptedStyleSheets = [...(shadow.adoptedStyleSheets ?? []), userSheet, widgetSheet]

  containerEl.value = container
})

// Keep the user CSS reactive to prop changes
watch(
  () => props.css,
  () => updateUserCSS(props.css),
  { flush: 'post' },
)

if (import.meta.hot) {
  import.meta.hot.accept('./widgets/css/widgets.build.css?raw', (mod) => {
    updateWidgetCSS(mod?.default ?? '')
  })
}

onBeforeUnmount(() => {
  containerEl.value?.remove?.()
  containerEl.value = null
})
</script>

<template>
  <!-- This element is the *shadow host* -->
  <span ref="hostEl" style="display: contents; all: initial"></span>
  <!-- nothing visible here; we Teleport into the shadow root's container -->
  <teleport v-if="containerEl" :to="containerEl">
    <slot />
  </teleport>
</template>

<style scoped>
/* optional host layout helpers */
</style>
