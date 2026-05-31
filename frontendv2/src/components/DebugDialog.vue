<script setup lang="ts">
import { ref, computed } from 'vue'
import { Teleport } from 'vue'

import DebugObjectCard from './DebugObjectCard.vue'
import AppIconButton from '@/components/used/AppIconButton.vue'

import type { Deck } from 'core/Deck.js'

const props = defineProps<{ deck: Deck }>()
const open = defineModel<boolean>('open', { default: false })

const filterText = ref('')
const filterShouldPersist = ref(false)
const filterShouldDelete = ref(false)
const filterIsDirty = ref(false)

const filteredObjects = computed(() =>
  props.deck.objectManager.getAllObjects().filter((obj) => {
    if (filterText.value.length > 0) {
      const text = `${obj.doctype}:${obj.subtype}`
      if (!text.includes(filterText.value) && !obj.id.includes(filterText.value)) return false
    }
    if (filterShouldPersist.value && !obj.shouldPersist()) return false
    if (filterShouldDelete.value && !obj.shouldDelete()) return false
    if (filterIsDirty.value && !props.deck.objectManager.dirtyIds.has(obj.id)) return false
    return true
  }),
)
</script>

<template>
  <Teleport to="body">
    <Transition name="backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-end p-4"
        @click.self="open = false"
      >
        <Transition name="panel" appear>
          <div
            v-if="open"
            class="w-full max-w-xl h-[calc(100vh-2rem)] flex flex-col rounded-md border border-white/10 bg-surface-container-low shadow-2xl overflow-hidden"
          >
            <!-- Header -->
            <div class="flex items-center gap-3 px-5 py-4 border-b border-white/5 shrink-0">
              <span class="material-symbols-outlined text-base leading-none text-primary">bug_report</span>
              <h2 class="flex-1 text-sm font-bold uppercase tracking-widest text-on-surface-variant">
                Object Manager
              </h2>
              <AppIconButton icon="close" size="sm" @click="open = false" />
            </div>

            <!-- Stats -->
            <div class="px-5 py-3 border-b border-white/5 shrink-0 space-y-1">
              <div class="flex gap-6 text-[10px] font-mono text-on-surface-variant/60">
                <span>version: <span class="text-on-surface/60">{{ deck.objectManager.version }}</span></span>
                <span>dirty: <span class="text-primary">{{ deck.objectManager.dirtyIds.size }}</span></span>
                <span>total: <span class="text-on-surface/60">{{ filteredObjects.length }} / {{ deck.objectManager.getAllObjects().length }}</span></span>
              </div>
              <div class="text-[10px] font-mono text-on-surface-variant/40 truncate">
                dirtyIds: {{ [...deck.objectManager.dirtyIds].join(', ') || '—' }}
              </div>
            </div>

            <!-- Filters -->
            <div class="px-5 py-3 border-b border-white/5 shrink-0 space-y-3">
              <input
                v-model="filterText"
                type="text"
                placeholder="Filter by doctype:subtype or id…"
                class="w-full bg-surface-container-lowest border border-outline-variant/20 focus:border-primary/50 rounded-xs px-3 py-2 text-xs font-light text-on-surface placeholder:text-on-surface/30 outline-none transition-colors"
              />
              <div class="flex items-center gap-5">
                <label
                  v-for="{ key, label } in [
                    { key: 'shouldPersist', label: 'shouldPersist' },
                    { key: 'shouldDelete', label: 'shouldDelete' },
                    { key: 'isDirty', label: 'isDirty' },
                  ]"
                  :key="key"
                  class="flex items-center gap-1.5 cursor-pointer select-none"
                >
                  <input
                    v-if="key === 'shouldPersist'"
                    v-model="filterShouldPersist"
                    type="checkbox"
                    class="accent-primary cursor-pointer"
                  />
                  <input
                    v-else-if="key === 'shouldDelete'"
                    v-model="filterShouldDelete"
                    type="checkbox"
                    class="accent-primary cursor-pointer"
                  />
                  <input
                    v-else
                    v-model="filterIsDirty"
                    type="checkbox"
                    class="accent-primary cursor-pointer"
                  />
                  <span class="text-[10px] font-mono text-on-surface-variant/60">{{ label }}</span>
                </label>
              </div>
            </div>

            <!-- Object list -->
            <div class="flex-1 overflow-y-auto px-5 py-4 space-y-2">
              <DebugObjectCard
                v-for="obj in filteredObjects"
                :key="obj.id"
                :obj="obj"
              />
              <p v-if="filteredObjects.length === 0" class="text-xs text-on-surface/30 italic text-center py-8">
                No objects match the current filters.
              </p>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.panel-enter-active,
.panel-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.panel-enter-from,
.panel-leave-to {
  transform: translateX(1rem);
  opacity: 0;
}
</style>
