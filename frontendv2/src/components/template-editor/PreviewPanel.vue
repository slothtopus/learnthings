<script setup lang="ts">
import { ref, computed } from 'vue'
import AppIconButton from '@/components/used/AppIconButton.vue'
import CardRenderer from '@/components/renderer/CardRenderer.vue'
import CardPreview from '@/components/renderer/CardPreview.vue'
import SelectDropdown from '@/components/SelectDropdown.vue'
import type { SelectOption } from '@/components/SelectDropdown.vue'

import type { CardTemplate } from 'core/CardTemplate.js'
import type { NoteType } from 'core/NoteType.js'

const props = defineProps<{
  cardTemplate: CardTemplate
  noteType: NoteType
}>()

defineEmits<{ close: [] }>()

const previewSide = defineModel<'front' | 'back'>('previewSide', { required: true })

// Variant select
const variantOptions = computed<SelectOption[]>(() =>
  props.cardTemplate.getAllVariants().map((v) => ({ value: v.id, label: v.name })),
)
const selectedVariantId = ref(props.cardTemplate.getDefaultVariant().id)
const selectedVariant = computed(() =>
  props.cardTemplate.getAllVariants().find((v) => v.id === selectedVariantId.value),
)

// Resolution select
const resolutionOptions: SelectOption[] = [
  { value: '1920x1080', label: '1920 × 1080' },
  { value: '1280x720',  label: '1280 × 720'  },
  { value: '1024x768',  label: '1024 × 768'  },
  { value: '768x1024',  label: '768 × 1024'  },
  { value: '390x844',   label: '390 × 844'   },
]
const selectedResolution = ref('1280x720')
const cardWidth  = computed(() => Number(selectedResolution.value.split('x')[0]))
const cardHeight = computed(() => Number(selectedResolution.value.split('x')[1]))
</script>

<template>
  <!-- Header row -->
  <div class="shrink-0 flex items-center justify-between px-3 h-[41px] border-b border-white/5">
    <span class="text-[9px] font-bold tracking-widest uppercase text-on-surface-variant/50 pl-1">Preview</span>
    <AppIconButton icon="chevron_right" size="sm" @click="$emit('close')" />
  </div>

  <!-- Controls toolbar — wraps gracefully at narrow widths -->
  <div class="shrink-0 flex flex-wrap gap-x-3 gap-y-2 px-3 py-2.5 border-b border-white/5">
    <!-- Side -->
    <div class="flex flex-col gap-1 shrink-0">
      <span class="text-[9px] font-bold tracking-widest uppercase text-on-surface-variant/40 px-0.5">Side</span>
      <div class="flex items-center bg-surface-container rounded-sm p-0.5 gap-px">
        <button
          v-for="side in ['front', 'back'] as const"
          :key="side"
          class="px-3 py-1 rounded-xs text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer"
          :class="
            previewSide === side
              ? 'bg-surface-container-highest text-on-surface'
              : 'text-on-surface-variant/40 hover:text-on-surface-variant'
          "
          @click="previewSide = side"
        >
          {{ side }}
        </button>
      </div>
    </div>

    <!-- Variant -->
    <div class="flex flex-col gap-1 flex-1 min-w-[90px]">
      <span class="text-[9px] font-bold tracking-widest uppercase text-on-surface-variant/40 px-0.5">Variant</span>
      <SelectDropdown
        v-model="selectedVariantId"
        :options="variantOptions"
        placeholder="Variant"
        size="sm"
        class="!space-y-0"
      />
    </div>

    <!-- Resolution -->
    <div class="flex flex-col gap-1 flex-1 min-w-[110px]">
      <span class="text-[9px] font-bold tracking-widest uppercase text-on-surface-variant/40 px-0.5">Resolution</span>
      <SelectDropdown
        v-model="selectedResolution"
        :options="resolutionOptions"
        size="sm"
        class="!space-y-0"
      />
    </div>
  </div>

  <!-- Card preview -->
  <div class="flex-1 p-4 overflow-hidden relative min-h-0">
    <CardPreview :width="cardWidth" :height="cardHeight">
      <div class="w-full h-full rounded-md bg-surface-container-high border border-outline-variant/20 overflow-hidden">
        <CardRenderer
          :card-template="cardTemplate"
          :variant="selectedVariant"
          :side="previewSide"
          :note="noteType.getAllNotes()[0]"
          :widget-settings="selectedVariant?.getWidgetSettingsContext()"
          @card:reveal="previewSide = 'back'"
          @card:next="previewSide = 'front'"
        />
      </div>
    </CardPreview>
  </div>
</template>
