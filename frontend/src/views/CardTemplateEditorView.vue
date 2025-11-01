<script setup lang="ts">
import { ref, computed, watch, useTemplateRef, nextTick } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

import { Button, Splitter, SplitterPanel, FloatLabel, Select } from 'primevue'

import AppFrameScreenLayout from '@/layouts/AppFrameScreenLayout.vue'
import CodeMirrorEditor from '@/components/common/CodeMirrorEditor.vue'
import TemplateEditorPreview from '@/components/template_editor/TemplateEditorPreview.vue'

import BlocksMenuV2 from '@/components/template_editor/BlocksMenuV2.vue'
import VariantsMenuV2 from '@/components/template_editor/VariantsMenuV2.vue'

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

const editingObj = ref<CardTemplateBlock | CardTemplateVariant | undefined>(
  cardTemplate.getDefaultVariant(),
)

const editingObj2 = ref<EditableObject>({
  obj: cardTemplate.getDefaultVariant(),
  template: 'front',
})

const editingTemplate = ref<'css' | 'front' | 'back' | undefined>('front')
watch(editingTemplate, () => {
  if (editingTemplate.value) {
  }
})

const templateOptions = [
  { id: 'css' as const, name: 'CSS' },
  { id: 'front' as const, name: 'Front' },
  {
    id: 'back' as const,
    name: 'Back',
  },
]
const selectedTemplateId = ref<(typeof templateOptions)[number]['id']>('css')

const editorModel = computed({
  get: () => {
    if (editingObj2.value?.obj instanceof CardTemplateVariant) {
      switch (editingObj2.value.template!) {
        case 'css':
          return editingObj2.value.obj.css
        case 'front':
          return editingObj2.value.obj.front
        case 'back':
          return editingObj2.value.obj.back
      }
    } else if (editingObj2.value?.obj instanceof CardTemplateBlock) {
      return editingObj2.value.obj.content
    }
    return ''
  },
  set: (content: string) => {
    if (editingObj2.value?.obj instanceof CardTemplateVariant) {
      switch (editingObj2.value.template!) {
        case 'css':
          editingObj2.value.obj.setCSS(content)
          break
        case 'front':
          editingObj2.value.obj.setFront(content)
          break
        case 'back':
          editingObj2.value.obj.setBack(content)
          break
      }
    } else if (editingObj2.value?.obj instanceof CardTemplateBlock) {
      return editingObj2.value.obj.setContent(content)
    }
  },
})

/*
const editorModel = computed({
  get: () => {
    if (editingObj.value instanceof CardTemplateBlock) {
      return editingObj.value!.content
    } else if (
      editingObj.value instanceof CardTemplateVariant &&
      editingTemplate.value !== undefined
    ) {
      switch (editingTemplate.value) {
        case 'css':
          return editingObj.value.css
        case 'front':
          return editingObj.value.front
        case 'back':
          return editingObj.value.back
      }
    }
    return ''
  },
  set: (content: string) => {
    if (editingObj.value instanceof CardTemplateBlock) {
      editingObj.value.setContent(content)
    } else if (
      editingObj.value instanceof CardTemplateVariant &&
      editingTemplate.value !== undefined
    ) {
      switch (editingTemplate.value) {
        case 'css':
          editingObj.value.setCSS(content)
          break
        case 'front':
          editingObj.value.setFront(content)
          break
        case 'back':
          editingObj.value.setBack(content)
          break
      }
    }
  },
})
*/

const editorModeOptions = [
  { id: 'css' as const, name: 'CSS' },
  { id: 'html' as const, name: 'HTML' },
]
const selectedEditorModeId = ref<(typeof editorModeOptions)[number]['id']>('css')
const editorModeDisabled = computed(() => editingObj.value instanceof CardTemplateVariant)
watch([editingObj, selectedTemplateId], ([newObj, newTemplateId]) => {
  if (newObj instanceof CardTemplateBlock) {
    selectedEditorModeId.value = 'html'
  } else if (newObj instanceof CardTemplateVariant) {
    switch (newTemplateId) {
      case 'css':
        selectedEditorModeId.value = 'css'
        break
      case 'front':
      case 'back':
        selectedEditorModeId.value = 'html'
    }
  }
})
const editingDefaultVariant = computed(
  () =>
    editingObj.value !== undefined &&
    editingObj.value instanceof CardTemplateVariant &&
    editingObj.value.name === 'default',
)

const handleSaveObj = async () => {
  await cardTemplate.deck.persist()
}

const handleDeleteObj = async () => {
  if (editingObj.value) {
    editingObj.value.flagShouldDelete(true)
    await cardTemplate.deck.persist()
    editingObj.value = undefined
  }
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
          <VariantsMenuV2 v-model="editingObj2" :card-template="cardTemplate" />
          <BlocksMenuV2 class="mt-4" v-model="editingObj2" :card-template="cardTemplate" />
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
              <h1 class="@xl:text-lg w-full truncate">Editing: {{ editingObj?.name }}</h1>
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

                <FloatLabel
                  v-if="editingObj instanceof CardTemplateVariant"
                  class="w-28"
                  variant="on"
                >
                  <Select
                    class="w-full"
                    inputId="template-select"
                    v-model="selectedTemplateId"
                    :options="templateOptions"
                    optionLabel="name"
                    optionValue="id"
                    size="small"
                  />
                  <label for="template-select">Template</label>
                </FloatLabel>
                <Button
                  v-if="editingObj !== undefined"
                  class="flex-none ml-auto @lg:ml-none"
                  :disabled="!editingObj?.shouldPersist()"
                  :pt="{ label: 'hidden @lg:block' }"
                  text
                  icon="pi pi-save"
                  label="Save"
                  @click="handleSaveObj"
                />
                <Button
                  v-if="editingObj !== undefined && !editingDefaultVariant"
                  class="flex-none"
                  :pt="{ label: 'hidden @lg:block' }"
                  text
                  icon="pi pi-trash"
                  label="Delete"
                  @click="handleDeleteObj"
                />
              </div>
            </div>
            <CodeMirrorEditor
              v-if="editingObj"
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
