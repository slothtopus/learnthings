<script setup lang="ts">
import { ref, computed } from 'vue'
import PageLayout from '@/components/PageLayout.vue'
import AppButton from '@/components/AppButton.vue'
import AppIconButton from '@/components/AppIconButton.vue'
import CodeEditor from '@/components/CodeEditor.vue'
import ViewToggle from '@/components/ViewToggle.vue'
import SidebarCollapsibleItem from '@/components/SidebarCollapsibleItem.vue'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

const breadcrumbs = [
  { label: 'Anatomy', href: '#' },
  { label: 'Flags of the World', href: '#' },
  { label: 'Settings', href: '#' },
  { label: 'Edit Template' },
]

const sidebarOpen = ref(true)
const layoutMode = ref<'editor' | 'split' | 'preview'>('split')

const layoutOptions = [
  { value: 'editor',  icon: 'code',          label: 'Editor' },
  { value: 'split',   icon: 'vertical_split', label: 'Split' },
  { value: 'preview', icon: 'visibility',     label: 'Preview' },
] as const
const previewSide = ref<'front' | 'back'>('front')
const activeTemplate = ref<'front' | 'back' | 'css'>('front')

const editorModeOptions = [
  { value: 'html', label: 'HTML', icon: 'code' },
  { value: 'css', label: 'CSS', icon: 'palette' },
]

// ViewToggle model — switches between css template and the last html template
const editorMode = computed({
  get: () => activeTemplate.value === 'css' ? 'css' : 'html',
  set: (val) => selectTemplate(val === 'css' ? 'css' : previewSide.value),
})

function selectTemplate(template: 'front' | 'back' | 'css') {
  activeTemplate.value = template
  if (template !== 'css') previewSide.value = template
}

const frontHtml = ref(`<div id="content">
  <div id="front" class="flag fade-in" style="background-image: url({{ flag }})">
  </div>
  <br />
</div>
<div id="controls">
  <reveal-button />
</div>`)

const backHtml = ref(`<div id="content">
  <div id="back" class="flag fade-in" style="background-image: url({{ flag }})">
  </div>
  <div id="answer">{{ country }}</div>
</div>`)

const cssContent = ref(`.flag {
  width: 100%;
  height: 100%;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}`)

const code = computed({
  get: () => {
    if (activeTemplate.value === 'front') return frontHtml.value
    if (activeTemplate.value === 'back') return backHtml.value
    return cssContent.value
  },
  set: (val) => {
    if (activeTemplate.value === 'front') frontHtml.value = val
    else if (activeTemplate.value === 'back') backHtml.value = val
    else cssContent.value = val
  },
})

const editorLanguage = computed<'html' | 'css'>(() =>
  activeTemplate.value === 'css' ? 'css' : 'html'
)

const blocks = ['Card template scoped', 'Note type scoped', 'Deck scoped']

const variantMenuItems = ['Rename', 'Duplicate', 'Delete']
const variantMenuOpen = ref(false)

// Panel sizing
const sidebarWidth = ref(224)
const previewWidth = ref(288)
const previewOpen = ref(true)

const SIDEBAR_MIN = 160
const SIDEBAR_MAX = 420
const PREVIEW_MIN = 200
const PREVIEW_MAX = 520

function makeResizeHandler(widthRef: { value: number }, direction: 1 | -1, min: number, max: number) {
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
</script>

<template>
  <PageLayout :breadcrumbs="breadcrumbs" :full-height="true" :constrained="false">
    <template #title>
      <span class="inline-flex items-center bg-primary/15 border border-primary/30 text-primary rounded-sm px-2 py-0.5 mr-0.5">Anatomy</span> Edit Template
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

            <!-- Variants -->
            <div class="px-3 pt-4 pb-3">
              <div class="flex items-center justify-between mb-2 px-1">
                <span class="text-[9px] font-bold tracking-widest uppercase text-on-surface-variant/50">Variants</span>
                <AppIconButton icon="add" size="sm" />
              </div>
              <SidebarCollapsibleItem icon="style" label="default" :active="variantMenuOpen">
                <template #action>
                  <DropdownMenu v-model:open="variantMenuOpen">
                    <DropdownMenuTrigger as-child>
                      <AppIconButton icon="more_horiz" size="sm" class="transition-opacity" :class="variantMenuOpen ? 'opacity-100 text-primary' : 'opacity-0 group-hover:opacity-100'" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" class="border-primary/40 rounded-xs">
                      <DropdownMenuItem v-for="item in variantMenuItems" :key="item">{{ item }}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </template>
                <div
                  v-for="template in (['front', 'back', 'css'] as const)"
                  :key="template"
                  class="flex items-center gap-2 rounded-xs ml-1 px-2 py-1.5 cursor-pointer transition-colors"
                  :class="activeTemplate === template
                    ? 'text-primary bg-primary/10'
                    : 'text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container'"
                  @click="selectTemplate(template)"
                >
                  <span class="material-symbols-outlined text-sm leading-none shrink-0">
                    {{ template === 'css' ? 'palette' : 'article' }}
                  </span>
                  <span class="text-xs font-light">{{ template }}</span>
                </div>
              </SidebarCollapsibleItem>
            </div>

            <div class="h-px bg-white/5 mx-3" />

            <!-- Blocks -->
            <div class="px-3 pt-4 pb-3">
              <div class="px-1 mb-2">
                <span class="text-[9px] font-bold tracking-widest uppercase text-on-surface-variant/50">Blocks</span>
              </div>
              <SidebarCollapsibleItem
                v-for="block in blocks"
                :key="block"
                icon="description"
                :label="block"
                action-icon="add"
              />
            </div>

            <div class="h-px bg-white/5 mx-3" />

            <!-- Attachment -->
            <div class="px-3 pt-4 pb-3">
              <div class="flex items-center justify-between px-1">
                <span class="text-[9px] font-bold tracking-widest uppercase text-on-surface-variant/50">Attachment</span>
                <AppIconButton icon="add" size="sm" />
              </div>
            </div>

          </div>

        <!-- Collapsed sidebar strip -->
        <div v-if="!sidebarOpen" class="w-10 shrink-0 border-r border-white/5 flex flex-col items-center pt-2">
          <AppIconButton icon="chevron_right" size="sm" @click="sidebarOpen = true" />
        </div>

        <!-- Sidebar resize handle (full height) -->
        <div
          v-if="sidebarOpen"
          class="w-1 shrink-0 cursor-col-resize group flex items-stretch"
          @mousedown="startSidebarResize"
        >
          <div class="w-px flex-1 bg-white/5 group-hover:bg-primary/40 transition-colors duration-150 mx-auto" />
        </div>

        <!-- Right-side wrapper: layout toggle + editor/preview -->
        <div class="flex-1 flex flex-col overflow-hidden min-w-0">

          <!-- Layout toggle row -->
          <div class="shrink-0 flex items-center justify-between gap-0.5 px-3 h-[49px] border-b border-white/5">
            <div class="flex items-center gap-0.5">
              <button
                v-for="opt in layoutOptions"
                :key="opt.value"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xs transition-colors cursor-pointer"
                :class="layoutMode === opt.value
                  ? 'text-primary bg-surface-container'
                  : 'text-on-surface-variant/40 hover:text-on-surface-variant'"
                @click="layoutMode = opt.value"
              >
                <span class="material-symbols-outlined text-base leading-none">{{ opt.icon }}</span>
                <span class="text-xs font-medium tracking-wide">{{ opt.label }}</span>
              </button>
            </div>
            <AppButton size="sm" icon="save">Save All</AppButton>
          </div>

          <!-- Editor + preview panels -->
          <div class="flex flex-1 overflow-hidden">

        <!-- Editor panel -->
        <div v-if="layoutMode !== 'preview'" class="flex-1 flex flex-col overflow-hidden min-w-0">

          <!-- Editor toolbar -->
          <div class="shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/5 gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm font-light text-on-surface">default</span>
              <span class="text-on-surface-variant/20">·</span>
              <span class="text-sm font-light text-on-surface">{{ activeTemplate }}</span>
            </div>
            <div class="flex items-center gap-3">
              <ViewToggle v-model="editorMode" :options="editorModeOptions" size="sm" />
            </div>
          </div>

          <!-- Code editor -->
          <div class="flex-1 overflow-hidden">
            <CodeEditor v-model="code" :language="editorLanguage" class="h-full" />
          </div>

        </div>

        <!-- Preview resize handle -->
        <div
          v-if="previewOpen && layoutMode === 'split'"
          class="w-1 shrink-0 cursor-col-resize group flex items-stretch"
          @mousedown="startPreviewResize"
        >
          <div class="w-px flex-1 bg-white/5 group-hover:bg-primary/40 transition-colors duration-150 mx-auto" />
        </div>

        <!-- Collapsed preview strip -->
        <div v-if="!previewOpen && layoutMode === 'split'" class="w-10 shrink-0 border-l border-white/5 flex flex-col items-center pt-2">
          <AppIconButton icon="chevron_left" size="sm" @click="previewOpen = true" />
        </div>

        <!-- Preview panel -->
        <div
          v-if="previewOpen && layoutMode !== 'editor'"
          class="shrink-0 flex flex-col overflow-hidden"
          :class="layoutMode === 'preview' ? 'flex-1' : ''"
          :style="layoutMode === 'split' ? { width: previewWidth + 'px' } : {}"
        >

          <!-- Preview header -->
          <div class="shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/5">
            <span class="text-[9px] font-bold tracking-widest uppercase text-on-surface-variant/50">Preview</span>
            <div class="flex items-center gap-2">
            <div class="flex items-center bg-surface-container rounded-sm p-0.5 gap-px">
              <button
                v-for="side in (['front', 'back'] as const)"
                :key="side"
                class="px-3 py-1 rounded-xs text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer"
                :class="previewSide === side
                  ? 'bg-surface-container-highest text-on-surface'
                  : 'text-on-surface-variant/40 hover:text-on-surface-variant'"
                @click="previewSide = side"
              >
                {{ side }}
              </button>
            </div>
            <AppIconButton icon="chevron_right" size="sm" @click="previewOpen = false" />
            </div>
          </div>

          <!-- Variant row -->
          <div class="shrink-0 flex items-center justify-between px-4 py-2 border-b border-white/5">
            <span class="text-[9px] font-bold tracking-widest uppercase text-on-surface-variant/30">Variant</span>
            <select class="bg-surface-container border border-outline-variant/20 text-xs font-light text-on-surface rounded-xs px-2 py-1 outline-none cursor-pointer">
              <option>default</option>
            </select>
          </div>

          <!-- Card preview -->
          <div class="flex-1 flex items-center justify-center p-6 overflow-auto">
            <div class="w-full aspect-[3/2] rounded-md bg-surface-container-high border border-outline-variant/20 overflow-hidden flex flex-col items-center justify-center relative">
              <!-- Simulated flag (Andorra colours) -->
              <div class="flex h-16 w-28 rounded-xs overflow-hidden shadow-lg">
                <div class="flex-1 bg-[#003DA5]" />
                <div class="flex-1 bg-[#FECC02]" />
                <div class="flex-1 bg-[#C8102E]" />
              </div>
              <!-- Reveal button — front only -->
              <div v-if="previewSide === 'front'" class="absolute bottom-3 left-1/2 -translate-x-1/2">
                <span class="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50 border border-outline-variant/30 rounded-xs px-3 py-1.5 bg-surface-container/60 cursor-pointer">
                  Reveal
                </span>
              </div>
              <!-- Answer — back only -->
              <div v-else class="mt-4 text-sm font-light text-on-surface/80">
                Andorra
              </div>
            </div>
          </div>

        </div>

          </div>
        </div>
      </div>
  </PageLayout>
</template>
