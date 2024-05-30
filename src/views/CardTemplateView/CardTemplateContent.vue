<script setup lang="ts">
import SectionLayout from '@/views/layouts/SectionLayout.vue'

import type { CardTemplate } from '@/lib/CardTemplate'

interface Props {
  card: CardTemplate
}
defineProps<Props>()
</script>

<template>
  <SectionLayout>
    <template #title>{{ card.name }}</template>
  </SectionLayout>
</template>

<style scoped></style>
