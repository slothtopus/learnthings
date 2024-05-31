<script setup lang="ts">
import CardTemplateDetailsSection from './CardTemplateDetailsSection.vue'
import CardTemplateTemplatesSection from './CardTemplateTemplatesSection.vue'

import type { CardTemplate } from '@/lib/CardTemplate'

interface Props {
  card: CardTemplate
}
defineProps<Props>()
</script>

<template>
  <CardTemplateDetailsSection :card="card" />
  <CardTemplateTemplatesSection :card="card" />
</template>

<style scoped></style>
