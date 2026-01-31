<script setup lang="ts">
import { Button } from 'primevue'
import RoundedContainer from './RoundedContainer.vue'

interface Props {
  subtitle: string
  title: string
  controls?: ('edit' | 'delete')[]
}
defineProps<Props>()

defineEmits<{
  edit: [value: void]
  delete: [value: void]
}>()
</script>

<template>
  <RoundedContainer class="w-full">
    <div class="flex items-center h-10">
      <span class="ml-2 dark:text-gray-300 font-thin">{{ subtitle }}:</span>
      <span class="ml-2 mr-auto font-light">{{ title }}</span>
      <Button
        v-if="controls?.includes('edit')"
        icon="pi pi-pencil"
        rounded
        severity="secondary"
        @click="$emit('edit')"
        size="small"
      />
      <Button
        v-if="controls?.includes('delete')"
        class="ml-2"
        icon="pi pi-times"
        rounded
        severity="secondary"
        @click="$emit('delete')"
        size="small"
      />
    </div>
    <slot />
  </RoundedContainer>
</template>

<style scoped></style>
