<script setup lang="ts">
import { ref, computed, shallowRef, onMounted, useTemplateRef } from 'vue'

import { Button, TieredMenu } from 'primevue'
import CardRenderer from '@/components/renderer/CardRenderer.vue'
import ChangeCardVariantForm from '@/components/forms/ChangeCardVariantForm.vue'
import type { FormData } from '@/components/forms/ChangeCardVariantForm.vue'

import { useRouter } from 'vue-router'
import { useRouteMetaObjects } from '@/composables/useRouteObjects'
import { useFormDialog } from '@/composables/useFormDialog'
import { useWidgetSettingsMenu } from '@/components/renderer/widgets/src/useWidgets'

import type { Card } from 'core/Card.js'
import { RenderedCard } from 'core/CardTemplate.js'

const router = useRouter()

const { getDeck } = useRouteMetaObjects()

const deck = getDeck()
const scheduler = deck.getActiveScheduler()
const revealed = ref(false)

const card = shallowRef<Card | undefined>(undefined)
const displayedCard = shallowRef<RenderedCard | undefined>(undefined)
let additionalContext: Record<string, string> = {}

onMounted(() => handleNextCard())

const handleNextCard = async () => {
  try {
    additionalContext = {}
    card.value = scheduler.nextCard()
    revealed.value = false
    await renderCard()
  } catch (err) {
    console.error(err)
    router.push('/')
  }
}

const handleAddContext = (context: Record<string, any>) => {
  Object.assign(additionalContext, context)
}

const renderCard = async () => {
  if (card.value === undefined) return
  if (!revealed.value) {
    displayedCard.value = await card.value.renderFront(additionalContext)
  } else {
    displayedCard.value = await card.value.renderBack(additionalContext)
  }
}

const handleReveal = async () => {
  revealed.value = true
  await renderCard()
}

const handleRated = async (value: number) => {
  if (card.value) {
    scheduler.cardRated(card.value, value)
  }
}

const { openDialog } = useFormDialog<FormData>(ChangeCardVariantForm, 'Change card variant')
const handleChangeVariant = async () => {
  if (card.value === undefined) return
  const template = card.value.getCardTemplate()
  const allVariants = template.getAllVariants()

  const result = await openDialog({
    variants: allVariants.map((v) => ({ name: v.name, id: v.id })),
    defaultVariantId: template.getDefaultVariant().id,
    cardVariantOverrideId: card.value.cardTemplateVariantId ?? null,
  })

  if (result.cancelled) return
  const { defaultVariantId, cardVariantOverrideId } = result.data
  card.value.setCardTemplateVariantId(cardVariantOverrideId ?? undefined)
  template.setDefaultVariantId(defaultVariantId)

  await template.deck.persist()
  await renderCard()
}

const variant = computed(() => card.value?.getCardTemplateVariant())

const { generateWidgetSettingsMenu } = useWidgetSettingsMenu()

const contextMenu = useTemplateRef('contextMenu')
const contextMenuItems = computed(() => [
  { label: 'Change variant', command: handleChangeVariant },
  {
    label: 'Widget Settings',
    items: variant.value ? generateWidgetSettingsMenu(variant.value) : [],
  },
])
const toggleContextMenu = (event: Event) => {
  contextMenu.value?.toggle(event)
}
</script>

<template>
  <main class="relative w-full h-full bg-black">
    <CardRenderer
      class="w-full h-full"
      :card="displayedCard"
      :widgetSettings="variant?.getWidgetSettingsContext()"
      @card:reveal="handleReveal"
      @card:rate="handleRated"
      @card:next="handleNextCard"
      @context:add="handleAddContext"
    />
    <div v-if="card !== undefined" class="absolute top-4 right-4">
      <Button
        icon="pi pi-ellipsis-v"
        size="small"
        severity="secondary"
        aria-haspopup="true"
        aria-controls="context-menu"
        @click="toggleContextMenu"
      />
      <TieredMenu ref="contextMenu" id="context-menu" :model="contextMenuItems" :popup="true" />
    </div>
  </main>
</template>

<style scoped></style>
