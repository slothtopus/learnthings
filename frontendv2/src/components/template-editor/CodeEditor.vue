<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState, Compartment } from '@codemirror/state'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'

const props = defineProps<{
  modelValue: string
  language: 'html' | 'css'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorEl = ref<HTMLElement | null>(null)
let view: EditorView | null = null

const languageConf = new Compartment()

const theme = EditorView.theme({
  '&': {
    backgroundColor: '#0c0e10',
    height: '100%',
  },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: '13px',
    lineHeight: '1.5rem',
  },
  '.cm-content': {
    caretColor: '#70d8c8',
    padding: '1rem 0',
  },
  '.cm-cursor': {
    borderLeftColor: '#70d8c8',
  },
  '.cm-selectionBackground, ::selection': {
    backgroundColor: 'rgba(112, 216, 200, 0.18) !important',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(112, 216, 200, 0.22) !important',
  },
  '.cm-gutters': {
    backgroundColor: '#0c0e10',
    color: 'rgba(226, 226, 229, 0.35)',
    border: 'none',
    borderRight: '1px solid rgba(255,255,255,0.12)',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 0.75rem 0 0.75rem',
    minWidth: '2.5rem',
  },
  '.cm-foldGutter .cm-gutterElement': {
    paddingRight: '0.5rem',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(255,255,255,0.025)',
    color: 'rgba(226, 226, 229, 0.5)',
  },
  '.cm-matchingBracket': {
    backgroundColor: 'rgba(112, 216, 200, 0.15)',
    outline: '1px solid rgba(112, 216, 200, 0.4)',
  },
  '.cm-tooltip': {
    backgroundColor: '#1e2022',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '4px',
  },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
    backgroundColor: 'rgba(112, 216, 200, 0.15)',
  },
}, { dark: true })

const highlightStyle = HighlightStyle.define([
  { tag: tags.comment,         color: '#4d6560', fontStyle: 'italic' },
  { tag: tags.keyword,         color: '#70d8c8' },
  { tag: tags.operator,        color: '#70d8c8' },
  { tag: tags.tagName,         color: '#70d8c8' },
  { tag: tags.angleBracket,    color: '#5a7e78' },
  { tag: tags.attributeName,   color: '#bcc9c5' },
  { tag: tags.attributeValue,  color: '#e8b86d' },
  { tag: tags.string,          color: '#e8b86d' },
  { tag: tags.number,          color: '#e89a9a' },
  { tag: tags.className,       color: '#a8d8ea' },
  { tag: tags.propertyName,    color: '#bcc9c5' },
  { tag: tags.punctuation,     color: '#5a7e78' },
  { tag: tags.meta,            color: '#4d6560' },
  { tag: tags.unit,            color: '#e89a9a' },
  { tag: tags.self,            color: '#70d8c8' },
  { tag: tags.variableName,    color: '#e2e2e5' },
])

function getLanguageExtension() {
  return props.language === 'html' ? html() : css()
}

onMounted(() => {
  view = new EditorView({
    state: EditorState.create({
      doc: props.modelValue,
      extensions: [
        basicSetup,
        theme,
        syntaxHighlighting(highlightStyle),
        languageConf.of(getLanguageExtension()),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            emit('update:modelValue', update.state.doc.toString())
          }
        }),
        EditorView.lineWrapping,
      ],
    }),
    parent: editorEl.value!,
  })
})

onBeforeUnmount(() => {
  view?.destroy()
})

const insert = (text: string) => {
  if (!view) return
  const { from, to } = view.state.selection.main
  view.dispatch({
    changes: { from, to, insert: text },
    selection: { anchor: from + text.length },
  })
  view.focus()
}

defineExpose({ insert })

watch(() => props.language, () => {
  view?.dispatch({
    effects: languageConf.reconfigure(getLanguageExtension()),
  })
})

watch(() => props.modelValue, (newVal) => {
  if (!view) return
  const current = view.state.doc.toString()
  if (current !== newVal) {
    view.dispatch({
      changes: { from: 0, to: current.length, insert: newVal },
    })
  }
})
</script>

<template>
  <div ref="editorEl" class="h-full overflow-hidden" />
</template>
