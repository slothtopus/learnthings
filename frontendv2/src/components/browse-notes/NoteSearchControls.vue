<script setup lang="ts">
import AppInput from '@/components/AppInput.vue'
import SelectDropdown from '@/components/SelectDropdown.vue'
import TagInput from '@/components/TagInput.vue'

export interface SelectOption {
  value: string
  label: string
}

const props = defineProps<{
  search: string
  fieldFilter: string
  fieldOptions: SelectOption[]
  noteTypeFilter: string
  noteTypeOptions: SelectOption[]
  tags: string[]
  tagOptions: string[]
}>()

const emit = defineEmits<{
  'update:search': [string]
  'update:fieldFilter': [string]
  'update:noteTypeFilter': [string]
  'update:tags': [string[]]
}>()
</script>

<template>
  <div class="space-y-3">
    <!-- Row 1: keyword search + field filter -->
    <div class="flex gap-2 items-end">
      <AppInput
        :model-value="props.search"
        icon="search"
        placeholder="Enter text to search..."
        size="md"
        class="w-full"
        @update:model-value="emit('update:search', $event)"
      />
    </div>

    <!-- Row 2: note type filter + tags -->
    <div class="flex gap-2 items-end">
      <SelectDropdown
        :model-value="props.noteTypeFilter"
        placeholder="All note types"
        :options="props.noteTypeOptions"
        size="md"
        class="flex-1"
        @update:model-value="emit('update:noteTypeFilter', $event)"
      />
      <TagInput
        :model-value="props.tags"
        :options="props.tagOptions"
        placeholder="Select tags..."
        size="md"
        class="flex-[2]"
        @update:model-value="emit('update:tags', $event)"
      />
    </div>
  </div>
</template>
