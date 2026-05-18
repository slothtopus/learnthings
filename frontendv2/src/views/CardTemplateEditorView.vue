<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import PageLayout from '@/components/used/PageLayout.vue'
import AppButton from '@/components/used/AppButton.vue'
import AppIconButton from '@/components/used/AppIconButton.vue'
import CodeEditor from '@/components/template-editor/CodeEditor.vue'
import ViewToggle from '@/components/used/ViewToggle.vue'

import VariantsMenu from '@/components/template-editor/VariantsMenu.vue'
import BlocksMenu from '@/components/template-editor/BlocksMenu.vue'
import AttachmentsMenu from '@/components/template-editor/AttachmentsMenu.vue'
import PreviewPanel from '@/components/template-editor/PreviewPanel.vue'

import { useRouteMetaObjects } from '@/composables/useRouteObjects'
import { useConfirmation } from '@/composables/useConfirmationDialog'
import type { CardTemplateVariant, CardTemplateBlock } from 'core/CardTemplate.js'

import { onBeforeRouteLeave } from 'vue-router'

const sidebarOpen = ref(true)
const layoutMode = ref<'editor' | 'split' | 'preview'>('split')

const layoutOptions = [
  { value: 'editor', icon: 'code', label: 'Editor' },
  { value: 'split', icon: 'vertical_split', label: 'Split' },
  { value: 'preview', icon: 'visibility', label: 'Preview' },
] as const
const previewSide = ref<'front' | 'back'>('front')

// Panel sizing
const sidebarWidth = ref(224)
const previewWidth = ref(288)
const previewOpen = ref(true)

const SIDEBAR_MIN = 160
const SIDEBAR_MAX = 600
const PREVIEW_MIN = 260
const PREVIEW_MAX = 600

function makeResizeHandler(
  widthRef: { value: number },
  direction: 1 | -1,
  min: number,
  max: number,
) {
  return (e: MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = widthRef.value

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    function onMove(e: MouseEvent) {
      const delta = (e.clientX - startX) * direction
      widthRef.value = Math.max(min, Math.min(max, startWidth + delta))
    }

    function onUp() {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }
}

const startSidebarResize = makeResizeHandler(sidebarWidth, 1, SIDEBAR_MIN, SIDEBAR_MAX)
const startPreviewResize = makeResizeHandler(previewWidth, -1, PREVIEW_MIN, PREVIEW_MAX)

// --------------------------
const { getCardTemplate, getDeck, getNoteType } = useRouteMetaObjects()
const cardTemplate = getCardTemplate()
const noteType = getNoteType()
const deck = getDeck()

const breadcrumbs = computed(() => [
  { label: 'Library', href: '/' },
  { label: `Deck: ${deck.name}`, href: `/deck/${deck.id}` },
  {
    label: `Edit template: ${cardTemplate.name}`,
    href: `/deck/${deck.id}/notetype/${noteType.id}/template/${cardTemplate.id}`,
  },
])

export type ActiveObject =
  | {
      type: 'variant'
      object: CardTemplateVariant
      template: 'css' | 'front' | 'back'
    }
  | { type: 'block'; object: CardTemplateBlock }

const activeObject = ref<ActiveObject>({
  type: 'variant',
  object: cardTemplate.getDefaultVariant(),
  template: 'front',
})

const code = computed({
  get: () => {
    if (activeObject.value.type === 'variant') {
      switch (activeObject.value.template) {
        case 'front':
          return activeObject.value.object.front
        case 'back':
          return activeObject.value.object.back
        default:
          return activeObject.value.object.css
      }
    } else if (activeObject.value.type === 'block') {
      return activeObject.value.object.content
    } else {
      return ''
    }
  },
  set: (newContent: string) => {
    if (activeObject.value.type === 'variant') {
      switch (activeObject.value.template) {
        case 'front':
          activeObject.value.object.setFront(newContent)
          break
        case 'back':
          activeObject.value.object.setBack(newContent)
          break
        default:
          activeObject.value.object.setCSS(newContent)
          break
      }
    } else if (activeObject.value.type === 'block') {
      activeObject.value.object.setContent(newContent)
    }
  },
})

const editorModeOptions = [
  { value: 'html', label: 'HTML', icon: 'code' },
  { value: 'css', label: 'CSS', icon: 'palette' },
]
const editorMode = ref<'html' | 'css'>('html')
watch(
  activeObject,
  () => {
    if (activeObject.value.type === 'variant') {
      editorMode.value = activeObject.value.template === 'css' ? 'css' : 'html'
    }
  },
  { immediate: true },
)

const codeEditorRef = ref<InstanceType<typeof CodeEditor> | null>(null)
const handleInsert = (text: string) => codeEditorRef.value?.insert(text)

const editableItems = computed(() => [
  ...cardTemplate.getAllVariants(),
  ...cardTemplate.getCardTemplateScopedBlocks(),
  ...cardTemplate.getNoteTypeScopedBlocks(),
  ...cardTemplate.getDeckScopedBlocks(),
])
const isDirty = computed(() => editableItems.value.some((o) => o.shouldPersist()))
const handleSaveAll = async () => {
  await deck.persist()
}

const { showConfirmation } = useConfirmation()
onBeforeRouteLeave(async () => {
  if (isDirty.value) {
    if (
      await showConfirmation(
        'Unsaved Changes',
        'Leaving this page will lose all unsaved changes. Are you sure?',
      )
    ) {
      editableItems.value.forEach((o) => o.revertToLastPersisted())
      return true
    } else {
      return false
    }
  }
  return true
})
</script>

<template>
  <PageLayout :breadcrumbs="breadcrumbs" :full-height="true" :constrained="false">
    <template #title>
      <span
        class="inline-flex items-center bg-primary/15 border border-primary/30 text-primary rounded-sm px-2 py-0.5 mr-0.5"
        >Anatomy</span
      >
      Edit Template
    </template>

    <!-- Three-panel layout -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <div
        v-if="sidebarOpen"
        class="shrink-0 flex flex-col overflow-y-auto"
        :style="{ width: sidebarWidth + 'px' }"
      >
        <!-- Collapse toggle -->
        <div class="flex justify-end items-center px-3 h-[49px] border-b border-white/5 shrink-0">
          <AppIconButton icon="chevron_left" size="sm" @click="sidebarOpen = false" />
        </div>

        <VariantsMenu v-model:active-object="activeObject" :card-template="cardTemplate" />

        <div class="h-px bg-white/5 mx-3" />

        <BlocksMenu v-model:active-object="activeObject" :card-template="cardTemplate" />

        <div class="h-px bg-white/5 mx-3" />

        <AttachmentsMenu :card-template="cardTemplate" @insert="handleInsert" />
      </div>

      <!-- Collapsed sidebar strip -->
      <div
        v-if="!sidebarOpen"
        class="w-10 shrink-0 border-r border-white/5 flex flex-col items-center pt-2"
      >
        <AppIconButton icon="chevron_right" size="sm" @click="sidebarOpen = true" />
      </div>

      <!-- Sidebar resize handle (full height) -->
      <div
        v-if="sidebarOpen"
        class="w-1 shrink-0 cursor-col-resize group flex items-stretch"
        @mousedown="startSidebarResize"
      >
        <div
          class="w-px flex-1 bg-white/5 group-hover:bg-primary/40 transition-colors duration-150 mx-auto"
        />
      </div>

      <!-- Right-side wrapper: layout toggle + editor/preview -->
      <div class="flex-1 flex flex-col overflow-hidden min-w-0">
        <!-- Layout toggle row -->
        <div
          class="shrink-0 flex items-center justify-between gap-0.5 px-3 h-[49px] border-b border-white/5"
        >
          <div class="flex items-center gap-0.5">
            <button
              v-for="opt in layoutOptions"
              :key="opt.value"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-xs transition-colors cursor-pointer"
              :class="
                layoutMode === opt.value
                  ? 'text-primary bg-surface-container'
                  : 'text-on-surface-variant/40 hover:text-on-surface-variant'
              "
              @click="layoutMode = opt.value"
            >
              <span class="material-symbols-outlined text-base leading-none">{{ opt.icon }}</span>
              <span class="text-xs font-medium tracking-wide">{{ opt.label }}</span>
            </button>
          </div>
          <AppButton size="sm" icon="save" :disabled="!isDirty" @click="handleSaveAll"
            >Save All</AppButton
          >
        </div>

        <!-- Editor + preview panels -->
        <div class="flex flex-1 overflow-hidden">
          <!-- Editor panel -->
          <div v-if="layoutMode !== 'preview'" class="flex-1 flex flex-col overflow-hidden min-w-0">
            <!-- Editor toolbar -->
            <div
              class="shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/5 gap-4"
            >
              <div class="flex items-center gap-2">
                <span class="text-sm font-light text-on-surface"
                  >{{ activeObject.type }}: {{ activeObject.object.name }}</span
                >
                <template v-if="activeObject.type === 'variant'">
                  <span class="text-on-surface-variant/20">·</span>
                  <span
                    v-if="activeObject.type === 'variant'"
                    class="text-sm font-light text-on-surface"
                    >{{ activeObject.template }}</span
                  >
                </template>
              </div>
              <div class="flex items-center gap-3">
                <ViewToggle
                  v-model="editorMode"
                  :options="editorModeOptions"
                  :disabled="activeObject.type === 'variant'"
                  size="sm"
                />
              </div>
            </div>

            <!-- Code editor -->
            <div class="flex-1 overflow-hidden">
              <CodeEditor
                ref="codeEditorRef"
                v-model="code"
                :language="editorMode"
                class="h-full"
              />
            </div>
          </div>

          <!-- Preview resize handle -->
          <div
            v-if="previewOpen && layoutMode === 'split'"
            class="w-1 shrink-0 cursor-col-resize group flex items-stretch"
            @mousedown="startPreviewResize"
          >
            <div
              class="w-px flex-1 bg-white/5 group-hover:bg-primary/40 transition-colors duration-150 mx-auto"
            />
          </div>

          <!-- Collapsed preview strip -->
          <div
            v-if="!previewOpen && layoutMode === 'split'"
            class="w-10 shrink-0 border-l border-white/5 flex flex-col items-center pt-2"
          >
            <AppIconButton icon="chevron_left" size="sm" @click="previewOpen = true" />
          </div>

          <!-- Preview panel -->
          <div
            v-if="previewOpen && layoutMode !== 'editor'"
            class="shrink-0 flex flex-col overflow-hidden"
            :class="layoutMode === 'preview' ? 'flex-1' : ''"
            :style="layoutMode === 'split' ? { width: previewWidth + 'px' } : {}"
          >
            <PreviewPanel
              v-model:preview-side="previewSide"
              :card-template="cardTemplate"
              :note-type="noteType"
              @close="previewOpen = false"
            />
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
</template>
