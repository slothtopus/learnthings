<script setup lang="ts">
import AppButton from '@/components/used/AppButton.vue'
import LinkButton from '@/components/used/LinkButton.vue'
import StripIconButton from '@/components/StripIconButton.vue'

import { useNoteTypeDetails } from '@/composables/useObjectDetails'

import type { NoteType } from 'core/NoteType.js'

const props = defineProps<{
  noteType: NoteType
}>()

const { noteCount, cardCount } = useNoteTypeDetails(() => props.noteType)

defineEmits<{
  new: []
  settings: []
  delete: []
  browse: []
}>()
</script>

<template>
  <div
    class="bg-surface-container-high rounded-md p-6 pr-16 transition-all duration-300 hover:bg-surface-container-highest group border border-outline-variant/10 hover:border-primary/20 relative overflow-hidden"
  >
    <!-- Right-side stacked icon actions -->
    <div
      class="absolute inset-y-0 right-0 w-12 flex flex-col items-center justify-center border-l border-outline-variant/10 bg-surface-container-highest/20"
    >
      <StripIconButton
        icon="settings"
        class="border-b border-outline-variant/10"
        @click="$emit('settings')"
      />
      <StripIconButton icon="delete" variant="destructive" @click="$emit('delete')" />
    </div>

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="flex-1">
        <h3
          class="text-xl font-extralight text-on-surface group-hover:text-primary transition-colors mb-2"
        >
          {{ noteType.name }}
        </h3>
        <p class="text-[11px] font-medium text-on-surface/40 uppercase tracking-widest">
          {{ noteCount }} Notes • {{ cardCount }} Cards
        </p>
        <LinkButton
          :label="`Browse All ${noteType.name} Notes`"
          class="mt-2"
          @click="$emit('browse')"
        />
      </div>
      <AppButton size="sm" @click="$emit('new')">New</AppButton>
    </div>
  </div>
</template>
