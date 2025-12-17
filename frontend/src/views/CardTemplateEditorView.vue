<script setup lang="ts">
import { ref, computed, watch, useTemplateRef, nextTick } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

import { Button, Splitter, SplitterPanel, FloatLabel, Select } from 'primevue'

import AppFrameScreenLayout from '@/layouts/AppFrameScreenLayout.vue'
import CodeMirrorEditor from '@/components/common/CodeMirrorEditor.vue'
import TemplateEditorPreview from '@/components/template_editor/TemplateEditorPreview.vue'

import BlocksMenu from '@/components/template_editor/BlocksMenu.vue'
import VariantsMenu from '@/components/template_editor/VariantsMenu.vue'
import AttachmentsMenu from '@/components/template_editor/AttachmentsMenu.vue'

import { useRouteMetaObjects } from '@/composables/useRouteObjects'
import { useConfirmation } from '@/composables/useConfirmationDialog'

import { CardTemplateBlock, CardTemplateVariant } from 'core/CardTemplate.js'

const { getDeck, getNoteType, getCardTemplate } = useRouteMetaObjects()

const deck = getDeck()
const noteType = getNoteType()
const cardTemplate = getCardTemplate()

const breadcrumbs = computed(() => {
  return [
    { icon: 'pi pi-book', label: deck.name },
    { label: 'Settings', route: `/settings/${deck.id}` },
    {
      label: 'Edit template',
      route: `/settings/${deck.id}/${noteType.id}/${cardTemplate.id}`,
    },
  ]
})

export type EditableObject =
  | { obj: CardTemplateVariant; template: 'css' | 'front' | 'back' }
  | {
      obj: CardTemplateBlock
      template: undefined
    }
  | undefined

const editingObj = ref<EditableObject>({
  obj: cardTemplate.getDefaultVariant(),
  template: 'front',
})

const editingTemplate = ref<'css' | 'front' | 'back' | undefined>('front')
watch(editingTemplate, () => {
  if (editingTemplate.value) {
  }
})

const editorModel = computed({
  get: () => {
    if (editingObj.value?.obj instanceof CardTemplateVariant) {
      switch (editingObj.value.template!) {
        case 'css':
          return editingObj.value.obj.css
        case 'front':
          return editingObj.value.obj.front
        case 'back':
          return editingObj.value.obj.back
      }
    } else if (editingObj.value?.obj instanceof CardTemplateBlock) {
      return editingObj.value.obj.content
    }
    return ''
  },
  set: (content: string) => {
    if (editingObj.value?.obj instanceof CardTemplateVariant) {
      switch (editingObj.value.template!) {
        case 'css':
          editingObj.value.obj.setCSS(content)
          break
        case 'front':
          editingObj.value.obj.setFront(content)
          break
        case 'back':
          editingObj.value.obj.setBack(content)
          break
      }
    } else if (editingObj.value?.obj instanceof CardTemplateBlock) {
      return editingObj.value.obj.setContent(content)
    }
  },
})

const editorModeOptions = [
  { id: 'css' as const, name: 'CSS' },
  { id: 'html' as const, name: 'HTML' },
]
const selectedEditorModeId = ref<(typeof editorModeOptions)[number]['id']>('css')
const editorModeDisabled = computed(() => editingObj.value?.obj instanceof CardTemplateVariant)

watch(editingObj, (newObj) => {
  if (newObj?.obj instanceof CardTemplateBlock) {
    selectedEditorModeId.value = 'html'
  } else if (newObj?.obj instanceof CardTemplateVariant) {
    switch (newObj.template!) {
      case 'css':
        selectedEditorModeId.value = 'css'
        break
      case 'front':
      case 'back':
        selectedEditorModeId.value = 'html'
    }
  }
})

const editorTitle = computed(() => {
  if (editingObj.value === undefined) {
    return ''
  }
  const { obj, template } = editingObj.value
  if (obj instanceof CardTemplateVariant) {
    return `Variant: ${obj.name}: ${template}`
  } else {
    return `Block: ${obj.name}`
  }
})

const handleSaveObj = async () => {
  await cardTemplate.deck.persist()
}

const { confirm } = useConfirmation()
onBeforeRouteLeave(async () => {
  const shouldPersistItems = [
    ...cardTemplate.getAllVariants(),
    ...cardTemplate.getDeckScopedBlocks(),
    ...cardTemplate.getNoteTypeScopedBlocks(),
    ...cardTemplate.getCardTemplateScopedBlocks(),
  ].filter((b) => b.shouldPersist())
  if (shouldPersistItems.length > 0) {
    if (await confirm('Are you sure?', 'Leaving this page will lose unsaved changes')) {
      shouldPersistItems.forEach((b) => b.revertToLastPersisted())
    } else {
      return false
    }
  }
})

const minimiseLeft = ref(false)
const splitterRef = useTemplateRef('splitterRef')
watch(minimiseLeft, async (newVal) => {
  if (!newVal) {
    await nextTick()
    splitterRef.value?.resetState()
  }
})


const cm = ref<InstanceType<typeof CodeMirrorEditor> | null>(null)
function insertText(text: string) {
  cm.value?.insertAtCursor(text)
}
</script>

<template>
  <AppFrameScreenLayout ref="layoutRef" :breadcrumbs="breadcrumbs" full-width no-padding>
    <template #content>
      <Splitter ref="splitterRef" class="w-full h-full border-none!" :gutter-size="2">
        <SplitterPanel
          v-if="!minimiseLeft"
          :size="20"
          :min-size="10"
          class="flex flex-col relative px-3 gap-3 overflow-y-auto!"
        >
          <div class="flex h-14 items-end py-2">
            <Button
              text
              icon="pi pi-angle-double-left"
              class="ml-auto"
              @click="minimiseLeft = true"
            />
          </div>
          <VariantsMenu v-model="editingObj" :card-template="cardTemplate" />
          <BlocksMenu class="mt-4" v-model="editingObj" :card-template="cardTemplate" />
          <AttachmentsMenu class="mt-4" :card-template="cardTemplate" @insert="insertText($event)"/>
        </SplitterPanel>
        <SplitterPanel :size="60" :min-size="10" class="flex overflow-auto!">
          <div v-if="minimiseLeft" class="flex h-14 items-end py-2 pl-3">
            <Button
              text
              icon="pi pi-angle-double-right"
              class="ml-auto"
              @click="minimiseLeft = false"
            />
          </div>
          <section class="@container flex flex-col w-full px-3 pb-3 min-w-80">
            <div class="flex flex-col @xl:flex-row gap-3 py-2 @xl:items-center">
              <h1 class="@xl:text-lg w-full truncate">{{ editorTitle }}</h1>
              <div class="flex gap-3 items-center">
                <FloatLabel class="w-28" variant="on">
                  <Select
                    class="w-full"
                    inputId="template-select"
                    v-model="selectedEditorModeId"
                    :options="editorModeOptions"
                    :disabled="editorModeDisabled"
                    optionLabel="name"
                    optionValue="id"
                    size="small"
                  />
                  <label for="template-select">Mode</label>
                </FloatLabel>
                <Button
                  v-if="editingObj !== undefined"
                  class="flex-none ml-auto @lg:ml-none"
                  :disabled="!editingObj.obj.shouldPersist()"
                  :pt="{ label: 'hidden @lg:block' }"
                  text
                  icon="pi pi-save"
                  label="Save All"
                  @click="handleSaveObj"
                />
              </div>
            </div>
            <CodeMirrorEditor
              v-if="editingObj"
              ref="cm"
              v-model="editorModel"
              :mode="selectedEditorModeId"
            />
          </section>
        </SplitterPanel>
        <SplitterPanel :size="20" :min-size="10" class="p-3">
          <h2>Preview</h2>
          <TemplateEditorPreview :template="cardTemplate" />
        </SplitterPanel>
      </Splitter>
    </template>
  </AppFrameScreenLayout>
</template>

<style scoped></style>
