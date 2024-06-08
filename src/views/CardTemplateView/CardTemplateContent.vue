<script setup lang="ts">
import CardTemplateDetailsSection from './CardTemplateDetailsSection.vue'
import CardTemplateTemplatesSection from './CardTemplateTemplatesSection.vue'

import type { CardTemplate } from '@/lib/CardTemplate'
import type { NoteType } from '@/lib/NoteType'

interface Props {
  card: CardTemplate
  noteType: NoteType
}
defineProps<Props>()
</script>

<template>
  <CardTemplateDetailsSection :card="card" />
  <CardTemplateTemplatesSection :card="card" :noteType="noteType" />
</template>

<style scoped></style>
