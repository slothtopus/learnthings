<script setup lang="ts">
import { ref, computed, shallowRef, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import CardRenderer from '@/components/renderer/CardRenderer.vue'
import AppIconButton from '@/components/used/AppIconButton.vue'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

import { useRouteMetaObjects } from '@/composables/useRouteObjects'
import type { Card } from 'core/Card.js'

const router = useRouter()
const { getDeck } = useRouteMetaObjects()
const deck = getDeck()
const scheduler = deck.getActiveScheduler()

const card = shallowRef<Card | undefined>(undefined)
const revealed = ref(false)
const additionalContext = ref<Record<string, unknown>>({})

// Holds the in-flight cardRated promise so handleNext can await it before advancing
let pendingRate: Promise<void> | null = null

function handleNextCard() {
  try {
    card.value = scheduler.nextCard()
    revealed.value = false
    additionalContext.value = {}
    pendingRate = null
  } catch {
    router.push({ name: 'deck-summary', params: { deckId: deck.id } })
  }
}

function handleReveal() {
  revealed.value = true
}

function handleRated(value: number) {
  if (card.value) {
    pendingRate = scheduler.cardRated(card.value, value)
  }
}

async function handleNext() {
  if (pendingRate) {
    await pendingRate
    pendingRate = null
  }
  handleNextCard()
}

function handleAddContext(context: Record<string, unknown>) {
  Object.assign(additionalContext.value, context)
}

const cardTemplate = computed(() => card.value?.getCardTemplate())
const note = computed(() => card.value?.getNote())
const variant = computed(() => card.value?.getCardTemplateVariant())

const handleChangeVariant = async () => {
  if (!card.value) return
  const template = card.value.getCardTemplate()
  const variants = template.getAllVariants()
  // Cycle through variants as a simple implementation until a proper dialog is added
  const currentId = card.value.cardTemplateVariantId ?? template.getDefaultVariant().id
  const idx = variants.findIndex((v) => v.id === currentId)
  const next = variants[(idx + 1) % variants.length]
  card.value.setCardTemplateVariantId(next.id === template.getDefaultVariant().id ? undefined : next.id)
  await template.deck.persist()
}

onMounted(() => handleNextCard())
</script>

<template>
  <main class="relative w-full h-dvh" style="background: #0c0e10">
    <CardRenderer
      v-if="card && cardTemplate && note && variant"
      class="w-full h-full"
      :card-template="cardTemplate"
      :variant="variant"
      :note="note"
      :side="revealed ? 'back' : 'front'"
      :widget-settings="variant.getWidgetSettingsContext()"
      :additional-context="additionalContext"
      @card:reveal="handleReveal"
      @card:rate="handleRated"
      @card:next="handleNext"
      @context:add="handleAddContext"
    />

    <!-- Overflow menu -->
    <div v-if="card" class="absolute top-4 right-4">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <AppIconButton icon="more_vert" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem @click="handleChangeVariant">Change variant</DropdownMenuItem>
          <DropdownMenuItem class="text-error" @click="router.push({ name: 'deck-summary', params: { deckId: deck.id } })">
            End review
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </main>
</template>
