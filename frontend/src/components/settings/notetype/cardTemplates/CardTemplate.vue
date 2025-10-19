<script setup lang="ts">
import FieldContainer from '@/components/common/FieldContainer.vue'

import { useConfirmation } from '@/composables/useConfirmationDialog'

import type { CardTemplate } from 'core/CardTemplate.js'

import { useRouter } from 'vue-router'

interface Props {
  cardTemplate: CardTemplate
}
const props = defineProps<Props>()

const router = useRouter()
const handleEdit = () => {
  router.push({
    name: 'card_template_editor',
    params: {
      cardTemplateId: props.cardTemplate.id,
      noteTypeId: props.cardTemplate.noteTypeId,
      deckId: props.cardTemplate.deck.id,
    },
  })
}

const { confirm } = useConfirmation()
const handleDelete = async () => {
  if (await confirm('Are you sure?', `Delete card template "${props.cardTemplate.name}?"`)) {
    console.error('Delete not implemented yet')
  }
}
</script>

<template>
  <FieldContainer
    subtitle="Name"
    :title="cardTemplate.name"
    :controls="['edit', 'delete']"
    @edit="handleEdit"
    @delete="handleDelete"
  />
</template>

<style scoped></style>
