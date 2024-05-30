<script setup lang="ts">
import NoteTypeDetailsSection from './NoteTypeDetailsSection.vue'
import NoteTypeFieldsSection from './NoteTypeFieldsSection.vue'
import NoteTypeCardTemplatesSection from './NoteTypeCardTemplatesSection.vue'

import type { NoteType } from '@/lib/NoteType'

interface Props {
  noteType: NoteType
}
defineProps<Props>()
</script>

<template>
  <NoteTypeDetailsSection :noteType="noteType" />
  <NoteTypeFieldsSection :noteType="noteType" />
  <NoteTypeCardTemplatesSection :noteType="noteType" />
</template>

<style scoped></style>
