<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const props = withDefaults(defineProps<{
  modelValue: string[]
  options?: string[]
  label?: string
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
}>(), {
  options: () => [],
  placeholder: 'Select tags...',
  size: 'md',
})

const emit = defineEmits<{ 'update:modelValue': [string[]] }>()

const open = ref(false)
const searchText = ref('')
const chipsRef = ref<HTMLElement>()
const overflowFrom = ref(0)

// All options including manually-added tags not in the provided options list
const allOptions = computed(() => {
  const optionSet = new Set(props.options)
  const extras = props.modelValue.filter(t => !optionSet.has(t))
  return [...props.options, ...extras]
})

const filteredOptions = computed(() => {
  if (!searchText.value) return allOptions.value
  const q = searchText.value.toLowerCase()
  return allOptions.value.filter(o => o.toLowerCase().includes(q))
})

const showAddNew = computed(() => {
  const s = searchText.value.trim()
  return s.length > 0 && !allOptions.value.some(o => o.toLowerCase() === s.toLowerCase())
})

const visibleTags = computed(() => props.modelValue.slice(0, overflowFrom.value))
const hiddenCount = computed(() => Math.max(0, props.modelValue.length - overflowFrom.value))

function toggleTag(tag: string) {
  if (props.modelValue.includes(tag)) {
    emit('update:modelValue', props.modelValue.filter(t => t !== tag))
  } else {
    emit('update:modelValue', [...props.modelValue, tag])
  }
}

function handleAddNew() {
  const t = searchText.value.trim()
  if (t && !props.modelValue.includes(t)) {
    emit('update:modelValue', [...props.modelValue, t])
    searchText.value = ''
  }
}

function handleEnter() {
  if (showAddNew.value) {
    handleAddNew()
  } else if (filteredOptions.value.length === 1) {
    toggleTag(filteredOptions.value[0])
    searchText.value = ''
  }
}

// Overflow detection: show all chips, measure, set cutoff
async function measureOverflow() {
  overflowFrom.value = props.modelValue.length
  await nextTick()

  if (!chipsRef.value) return
  const containerWidth = chipsRef.value.clientWidth
  const chips = Array.from(chipsRef.value.querySelectorAll<HTMLElement>('[data-chip]'))
  if (!chips.length) return

  const GAP = 6 // gap-1.5
  const OVERFLOW_W = 42 // approx width of "+N" chip

  let consumed = 0
  for (let i = 0; i < chips.length; i++) {
    const chipW = chips[i].offsetWidth + GAP
    const hasMore = i < chips.length - 1
    if (consumed + chipW + (hasMore ? OVERFLOW_W + GAP : 0) > containerWidth) {
      overflowFrom.value = i
      return
    }
    consumed += chipW
  }
  overflowFrom.value = chips.length
}

let ro: ResizeObserver | null = null
onMounted(() => {
  overflowFrom.value = props.modelValue.length
  if (chipsRef.value) {
    ro = new ResizeObserver(measureOverflow)
    ro.observe(chipsRef.value)
  }
  measureOverflow()
})
onBeforeUnmount(() => ro?.disconnect())
watch(() => props.modelValue.length, measureOverflow)
</script>

<template>
  <div class="space-y-3">
    <label v-if="label" class="block text-[10px] font-light uppercase tracking-[0.3em] text-on-surface-variant">
      {{ label }}
    </label>

    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <button
          type="button"
          :class="[
            'bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/40',
            'rounded-sm px-4 flex items-center gap-2 w-full transition-all',
            size === 'sm' && 'h-8',
            size === 'md' && 'h-10',
            size === 'lg' && 'h-12',
            open && 'border-primary/40',
          ]"
        >
          <div ref="chipsRef" class="flex items-center gap-1.5 overflow-hidden flex-1 min-w-0">
            <span
              v-for="tag in visibleTags"
              :key="tag"
              data-chip
              :class="[
                'flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary font-medium whitespace-nowrap rounded-xs shrink-0',
                size === 'lg' ? 'text-sm px-2.5 py-1' : size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2 py-0.5',
              ]"
            >
              {{ tag }}
              <span
                :class="['material-symbols-outlined leading-none cursor-pointer hover:text-on-surface/70 transition-colors', size === 'lg' ? 'text-sm' : 'text-xs']"
                @click.stop="toggleTag(tag)"
              >close</span>
            </span>

            <span
              v-if="hiddenCount > 0"
              :class="[
                'flex items-center bg-surface-container border border-outline-variant/30 text-on-surface-variant font-medium whitespace-nowrap rounded-xs shrink-0',
                size === 'lg' ? 'text-sm px-2.5 py-1' : size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2 py-0.5',
              ]"
            >+{{ hiddenCount }}</span>

            <span
              v-if="!modelValue.length"
              :class="[
                'text-on-surface/30',
                size === 'lg' ? 'text-sm' : size === 'sm' ? 'text-xs' : 'text-xs',
              ]"
            >{{ placeholder }}</span>
          </div>
          <span
            class="material-symbols-outlined text-on-surface/40 shrink-0 text-sm transition-transform duration-200"
            :class="open && 'rotate-180'"
          >expand_more</span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        class="p-0 w-[var(--reka-popover-trigger-width)] bg-black border-primary/60"
        align="start"
        :side-offset="4"
      >
        <div class="flex flex-col">
          <div class="flex items-center gap-2 border-b border-primary/30 px-3 h-9">
            <span class="material-symbols-outlined text-sm text-white/30">search</span>
            <input
              v-model="searchText"
              :placeholder="placeholder"
              class="flex-1 bg-transparent text-sm outline-none text-white placeholder:text-white/25"
              @keydown.enter.prevent="handleEnter"
            />
          </div>
          <div class="max-h-[200px] overflow-y-auto py-1">
            <p v-if="!filteredOptions.length && !showAddNew" class="py-6 text-center text-sm text-white/25">
              No tags found
            </p>
            <button
              v-for="option in filteredOptions"
              :key="option"
              type="button"
              class="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-primary/15 cursor-pointer text-left transition-colors"
              @click="toggleTag(option)"
            >
              <span
                :class="['material-symbols-outlined text-sm text-primary transition-opacity', modelValue.includes(option) ? 'opacity-100' : 'opacity-0']"
              >check</span>
              <span class="text-sm text-white/80">{{ option }}</span>
            </button>
            <button
              v-if="showAddNew"
              type="button"
              class="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-primary/15 cursor-pointer text-left transition-colors"
              @click="handleAddNew"
            >
              <span class="material-symbols-outlined text-sm text-primary">add</span>
              <span class="text-sm text-white/40">Add "{{ searchText.trim() }}"</span>
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>
