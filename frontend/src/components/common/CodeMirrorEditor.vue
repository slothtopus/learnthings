<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

import { EditorState, EditorSelection } from '@codemirror/state'
import { EditorView, basicSetup } from 'codemirror'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { keymap } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'
import { oneDark } from '@codemirror/theme-one-dark'

interface Props {
  modelValue: string
  mode: 'css' | 'html'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorElement = ref<HTMLDivElement | null>(null)

let editor: EditorView

const updateHandler = EditorView.updateListener.of((v) => {
  if (v.docChanged) {
    emit('update:modelValue', editor.state.doc.toString())
  }
})


const insertAtCursor = (text: string) => {
  if (!editor) return

  // Replace selection(s) with text; place cursor after inserted text
  editor.dispatch(
    editor.state.changeByRange((range) => ({
      changes: { from: range.from, to: range.to, insert: text },
      range: EditorSelection.cursor(range.from + text.length),
    })),
  )

  editor.focus()
}

defineExpose({
  insertAtCursor,
})

const createState = () => {
  const extensions = [
    basicSetup,
    props.mode === 'html' ? html() : css(),
    oneDark,
    updateHandler,
    keymap.of([indentWithTab]),
  ]
  const newState = EditorState.create({
    doc: props.modelValue,
    extensions: extensions,
  })
  return newState
}

onMounted(() => {
  if (editorElement.value !== null) {
    editor = new EditorView({
      state: createState(),
      parent: editorElement.value,
    })
  }
})

// Watch for changes to the modelValue prop and update the editor content
watch(
  () => props.modelValue,
  (newValue) => {
    if (editor && editor.state.doc.toString() !== newValue) {
      const transaction = editor.state.update({
        changes: {
          from: 0,
          to: editor.state.doc.length,
          insert: newValue,
        },
      })
      editor.dispatch(transaction)
    }
  },
)

watch(
  () => props.mode,
  () => {
    editor.setState(createState())
  },
)
</script>

<template>
  <div ref="editorElement" @click.prevent class="editor-wrapper rounded-md cm-s-dracula"></div>
</template>

<style scoped>
.editor-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-size: 12px;
  overflow: hidden;
}

:deep(.cm-editor) {
  flex: 1;
  overflow: auto; /* Enable scrolling within the editor */
  height: 100%;
}

:deep(.cm-scroller) {
  height: 100%; /* Ensure the scroller takes full height */
}
</style>
