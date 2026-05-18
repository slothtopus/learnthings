<script setup lang="ts">
import AppIconButton from '@/components/used/AppIconButton.vue'
import CardRenderer from '@/components/renderer/CardRenderer.vue'
import CardPreview from '@/components/renderer/CardPreview.vue'
import type { CardTemplate } from 'core/CardTemplate.js';
import type { Note } from 'core/Note.js';

defineProps<{
  cardTemplate: CardTemplate
  note: Note
}>()

const emit = defineEmits<{
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
        <div v-for="side in ['front', 'back'] as const" :key="side" class="flex flex-col gap-1.5">
          <span class="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50">{{ side }}</span>
          <div class="aspect-[1280/720]">
            <CardPreview :width="1280" :height="720">
              <CardRenderer :card-template="cardTemplate" :note="note" :side="side" />
            </CardPreview>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
