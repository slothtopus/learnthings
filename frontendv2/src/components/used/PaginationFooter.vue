<script setup lang="ts">
import { computed } from 'vue'
import SelectDropdown from '@/components/SelectDropdown.vue'
import type { SelectOption } from '@/components/SelectDropdown.vue'

const props = withDefaults(
  defineProps<{
    currentPage: number
    totalResults: number
    pageSize: number
    windowSize?: number
  }>(),
  { windowSize: 5 },
)

const emit = defineEmits<{
  'update:currentPage': [page: number]
  'update:pageSize': [size: number]
}>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalResults / props.pageSize)))

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) emit('update:currentPage', page)
}

// Builds a list of exactly `windowSize` page buttons (plus ellipsis markers where needed).
// Page 1 and totalPages are always anchored; the remaining slots form a sliding window around currentPage.
const pageItems = computed((): (number | null)[] => {
  const { currentPage, windowSize } = props
  const total = totalPages.value

  if (total <= windowSize) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const innerCount = windowSize - 2
  let start = Math.max(2, currentPage - Math.floor(innerCount / 2))
  let end = start + innerCount - 1

  if (end >= total) {
    end = total - 1
    start = Math.max(2, end - innerCount + 1)
  }

  const inner = Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i)
  const pages = [1, ...inner, total]

  const result: (number | null)[] = []
  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i] - pages[i - 1]! > 1) result.push(null)
    result.push(pages[i])
  }
  return result
})

const pageSizeOptions: SelectOption[] = [
  { value: '5', label: '5 / page' },
  { value: '25', label: '10 / page' },
  { value: '50', label: '50 / page' },
]

const pageSizeValue = computed(() => String(props.pageSize))

function onPageSizeChange(value: string) {
  emit('update:pageSize', Number(value))
  emit('update:currentPage', 1)
}
</script>

<template>
  <footer class="fixed bottom-0 left-0 w-full bg-background/90 backdrop-blur-md border-t border-outline-variant/10 z-40">
    <div class="max-w-6xl mx-auto px-8 h-14 flex items-center justify-between gap-4">
      <!-- Prev -->
      <button
        class="w-10 h-10 flex items-center justify-center text-on-surface/60 hover:text-primary transition-colors active:scale-90 rounded-xs hover:bg-surface-container-high/50 shrink-0"
        @click="goToPage(currentPage - 1)"
      >
        <span class="material-symbols-outlined">chevron_left</span>
      </button>

      <!-- Page numbers -->
      <nav class="flex items-center gap-1.5">
        <template v-for="(item, i) in pageItems" :key="i">
          <span
            v-if="item === null"
            class="text-on-surface/40 mx-1 text-xs tracking-widest select-none"
          >...</span>
          <button
            v-else
            :class="[
              'w-9 h-9 flex items-center justify-center text-xs font-bold tracking-widest rounded-xs transition-all active:scale-90 cursor-pointer',
              currentPage === item
                ? 'bg-primary text-on-primary shadow-md'
                : 'text-on-surface/60 hover:text-primary hover:bg-surface-container-high/50',
            ]"
            @click="goToPage(item)"
          >
            {{ item }}
          </button>
        </template>
      </nav>

      <!-- Next + page size -->
      <div class="flex items-center gap-3 shrink-0">
        <button
          class="w-10 h-10 flex items-center justify-center text-on-surface/60 hover:text-primary transition-colors active:scale-90 rounded-xs hover:bg-surface-container-high/50"
          @click="goToPage(currentPage + 1)"
        >
          <span class="material-symbols-outlined">chevron_right</span>
        </button>

        <div class="w-32">
          <SelectDropdown
            :model-value="pageSizeValue"
            :options="pageSizeOptions"
            size="sm"
            @update:model-value="onPageSizeChange"
          />
        </div>
      </div>
    </div>
  </footer>
</template>
