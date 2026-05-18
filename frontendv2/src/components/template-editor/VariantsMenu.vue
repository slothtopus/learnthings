<script setup lang="ts">
import { computed } from 'vue'

import VariantMenuItem from '@/components/template-editor/VariantMenuItem.vue'
import AppIconButton from '@/components/used/AppIconButton.vue'
import NewNamedObjectDialog from '@/components/used/NewNamedObjectDialog.vue'
import type {
  NewNamedObjectFormData,
  NewNamedObjectContext,
} from '@/components/used/NewNamedObjectDialog.vue'
import type {ActiveObject} from '@/views/CardTemplateEditorView.vue'

import { useFormDialog } from '@/composables/useFormDialog'

import type { CardTemplate } from 'core/CardTemplate.js'

interface Props {
  cardTemplate: CardTemplate
}
const props = defineProps<Props>()

const activeObject = defineModel<ActiveObject>('activeObject', { required: true })

const variants = computed(() => props.cardTemplate.getAllVariants())

const newNamedObjectDialog = useFormDialog<NewNamedObjectFormData, NewNamedObjectContext>(
  NewNamedObjectDialog,
)
const handleNewVariant = async () => {
  const result = await newNamedObjectDialog.open(
    { name: '' },
    { title: 'Create New Variant', label: 'Card Template Variant Name', placeholder: '...' },
  )
  if (!result.cancelled) {
    const { name } = result.data
    const variant = props.cardTemplate.createNewVariant(name)
    activeObject.value = { type: 'variant', object: variant, template: 'front' }
  }
  await props.cardTemplate.deck.persist()
}
</script>

<template>
  <div class="px-3 pt-4 pb-3">
    <div class="flex items-center justify-between mb-2 px-1">
      <span class="text-[9px] font-bold tracking-widest uppercase text-on-surface-variant/50"
        >Variants</span
      >
      <AppIconButton icon="add" size="sm" @click="handleNewVariant" />
    </div>
    <VariantMenuItem
      v-for="variant in variants"
      :key="variant.id"
      :variant="variant"
      v-model:active-object="activeObject"
    />
  </div>
</template>

<style scoped></style>
