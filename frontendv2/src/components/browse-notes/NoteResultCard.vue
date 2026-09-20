<script setup lang="ts">
import { computed } from 'vue'

import AppIconButton from '@/components/common/AppIconButton.vue'

import type { Note } from 'core/Note.js'

export type ResultLine = {
  /** The field the text came from. */
  label: string
  /** Matching text with its surrounding context, or a preview when browsing. */
  snippet: string
}

interface Props {
  note: Note
  /** One line per field that matched; the first is shown as the headline. */
  lines: ResultLine[]
}

const props = defineProps<Props>()

defineEmits<{ delete: [] }>()

const headline = computed(() => props.lines[0])
const rest = computed(() => props.lines.slice(1))
const cardCount = computed(() => props.note.getAllCards().length)
</script>

<template>
  <section class="space-y-2">
    <div
      class="group flex flex-col bg-surface-container-high hover:bg-surface-container-highest border border-transparent hover:border-outline-variant/20 transition-all duration-200 rounded-md cursor-pointer overflow-hidden"
    >
      <!-- Main row -->
      <div class="flex items-start justify-between px-4 pt-3.5 pb-3">
        <div class="flex flex-col items-start min-w-0 gap-1">
          <span class="text-[9px] font-bold tracking-widest uppercase text-on-surface-variant">{{
            headline?.label
          }}</span>
          <h3
            class="text-sm tracking-tight text-on-surface truncate group-hover:text-primary transition-colors font-normal"
          >
            {{ headline?.snippet }}
          </h3>

          <!-- Further fields the search matched in -->
          <p
            v-for="line in rest"
            :key="line.label"
            class="text-xs font-light text-on-surface-variant/70 truncate"
          >
            <span class="text-on-surface-variant/50">{{ line.label }}:</span> {{ line.snippet }}
          </p>
        </div>
        <div class="flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <AppIconButton icon="delete" size="sm" variant="destructive" @click.stop="$emit('delete')" />
        </div>
      </div>
      <!-- Footer strip -->
      <div
        class="flex items-center gap-2.5 px-4 py-2 border-t border-outline-variant/10 bg-surface-container-low/30"
      >
        <span
          class="inline-flex items-center bg-primary/15 border border-primary/30 text-primary rounded-sm px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase"
          >{{ note.noteType.name }}</span
        >
        <span class="text-[10px] font-medium tracking-wide text-on-surface-variant/70 uppercase"
          >Cards: {{ cardCount }}</span
        >
      </div>
    </div>
  </section>
</template>
