<script setup lang="ts">
import { computed } from 'vue'

import { Button } from 'primevue'

import VariantMenuItem from './VariantMenuItem.vue'
import CreateNewNamedObjectForm from '@/components/forms/CreateNewNamedObjectForm.vue'
import type { FormData } from '@/components/forms/CreateNewNamedObjectForm.vue'
import { useFormDialog } from '@/composables/useFormDialog'

import type { CardTemplate } from 'core/CardTemplate.js'
import { CardTemplateVariant } from 'core/CardTemplate.js'
import { PersistableObject } from 'core/PersistableObject.js'

interface Props {
  cardTemplate: CardTemplate
}
const props = defineProps<Props>()

const allVariants = computed(() => props.cardTemplate.getAllVariants())

const selected = defineModel<PersistableObject<any> | undefined>()

const { openDialog: openVariantDialog } = useFormDialog<FormData>(
  CreateNewNamedObjectForm,
  'Create new variant',
)

const handleCreateNewVariant = async () => {
  const result = await openVariantDialog()
  if (result.cancelled) return
  const { name } = result.data
  const variant = CardTemplateVariant.createNewEmpty(props.cardTemplate.objectManager, {
    name,
    cardTemplateId: props.cardTemplate.id,
  })
  props.cardTemplate.objectManager.setObject(variant)
}
</script>

<template>
  <div>
    <div class="flex gap-2 items-center px-2 mb-2 border-b-1 border-gray-700">
      <h2 class="w-full truncate">Variants</h2>
      <Button text icon="flex-0 pi pi-plus" @click="handleCreateNewVariant" />
    </div>
    <VariantMenuItem
      v-for="variant in allVariants"
      :key="variant.id"
      :variant="variant"
      :is-default="variant.id === cardTemplate.getDefaultVariant().id"
      :is-selected="selected?.id === variant.id"
      @click="selected = variant"
      @make-default="cardTemplate.setDefaultVariantId(variant.id)"
    />
  </div>
</template>

<style scoped></style>
