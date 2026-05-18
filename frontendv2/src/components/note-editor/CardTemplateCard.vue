<script setup lang="ts">
import AppIconButton from '@/components/used/AppIconButton.vue'
import type { CardTemplate } from 'core/CardTemplate.js';

defineProps<{
  cardTemplate: CardTemplate
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'update:selectedVariant': [value: string]
  edit: []
  settings: []
  delete: []
}>()
</script>

<template>
  <div class="bg-surface-container-high border border-outline-variant/20 border-l-4 rounded-md flex gap-6 group hover:border-l-primary/40 hover:border-outline-variant/40 transition-all duration-300 py-4 px-6">
    <div class="flex items-start pt-1 shrink-0">
      <span class="material-symbols-outlined text-xl leading-none p-2 rounded-xs text-on-surface-variant hover:text-primary transition-all duration-200 cursor-grab active:cursor-grabbing">drag_indicator</span>
    </div>
    <div class="flex-grow min-w-0 flex flex-col gap-5">
      <!-- Header row -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-on-surface-variant">
          {{ cardTemplate.name }}
        </div>

        <div class="flex items-center gap-1">
          <AppIconButton icon="edit" size="sm" class="hover:bg-primary/10" @click="emit('edit')" />
          <AppIconButton icon="settings" size="sm" class="hover:bg-primary/10" @click="emit('settings')" />
          <div class="w-px h-4 bg-white/10 mx-1" />
          <AppIconButton icon="delete" size="sm" variant="destructive" @click="emit('delete')" />
        </div>
      </div>

      <!-- Card previews -->
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1.5">
          <span class="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50">Front</span>
          <div
            class="aspect-[3/2] rounded-sm border border-outline-variant/10 flex items-center justify-center overflow-hidden"
            style="background: linear-gradient(135deg, #1e2022 0%, #0c0e10 100%)"
          >
            <slot name="front">
              <span class="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/20">Front</span>
            </slot>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <span class="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50">Back</span>
          <div
            class="aspect-[3/2] rounded-sm border border-outline-variant/10 flex items-center justify-center overflow-hidden"
            style="background: linear-gradient(135deg, #1e2022 0%, #0c0e10 100%)"
          >
            <slot name="back">
              <span class="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/20">Back</span>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
