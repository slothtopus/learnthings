<script setup lang="ts">
interface Props {
  noteId?: number
}
defineProps<Props>()
</script>

<template>
  <div class="flex text-nowrap overflow-hidden">
    {{ 'Note:'
    }}<span class="text-orange-200 text-ellipsis overflow-hidden ml-1">{{ noteId || '...' }}</span>
  </div>
</template>

<style scoped></style>
