<script setup lang="ts">
import { ref, computed } from 'vue'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export interface SelectOption {
  value: string
  label: string
}

const props = withDefaults(defineProps<{
  label?: string
  modelValue: string
  options?: SelectOption[]
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
}>(), {
  options: () => [],
  size: 'md',
})

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const open = ref(false)

const displayLabel = computed(() =>
  props.options.find(o => o.value === props.modelValue)?.label
    ?? (props.modelValue ? props.modelValue : props.placeholder ?? '')
)

const hasSelection = computed(() => !!props.options.find(o => o.value === props.modelValue))

function select(value: string) {
  emit('update:modelValue', value)
  open.value = false
}
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
            'px-4 rounded-sm flex items-center justify-between gap-2 transition-all w-full',
            size === 'sm' && 'h-8',
            size === 'md' && 'h-10',
            size === 'lg' && 'h-12',
            open && 'border-primary/40',
          ]"
        >
          <span
            :class="[
              'font-bold uppercase tracking-widest truncate',
              size === 'lg' ? 'text-[10px]' : 'text-[9px]',
              hasSelection ? 'text-on-surface' : 'text-on-surface/30',
            ]"
          >{{ displayLabel }}</span>
          <span
            class="material-symbols-outlined text-on-surface-variant text-sm transition-transform duration-200 shrink-0"
            :class="open && 'rotate-180'"
          >expand_more</span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        class="p-0 w-[var(--reka-popover-trigger-width)] bg-black border-primary/60"
        align="start"
        :side-offset="4"
      >
        <div class="py-1">
          <button
            v-for="option in options"
            :key="option.value"
            type="button"
            class="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-primary/15 cursor-pointer text-left transition-colors"
            @click="select(option.value)"
          >
            <span
              :class="['material-symbols-outlined text-sm text-primary transition-opacity', modelValue === option.value ? 'opacity-100' : 'opacity-0']"
            >check</span>
            <span class="text-sm text-white/80">{{ option.label }}</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>
