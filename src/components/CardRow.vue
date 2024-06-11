<script setup lang="ts">
import AspectPreview from '@/components/AspectPreview.vue'
import type { RenderedCard } from '@/lib/CardTemplate'

interface Props {
  name: string
  renderedFront: RenderedCard
  renderedBack: RenderedCard
  dims: number[]
}
defineProps<Props>()
</script>

<template>
  <section class="w-full flex flex-col gap-4 p-4">
    <h2 class="text-lg text-center">{{ name }}</h2>
    <div class="previews">
      <AspectPreview
        class="w-full"
        align="right"
        :html="renderedFront.html"
        :css="renderedFront.css"
        :previewWidth="dims[0]"
        :previewHeight="dims[1]"
      />
      <AspectPreview
        class="w-full"
        align="left"
        :html="renderedBack.html"
        :css="renderedBack.css"
        :previewWidth="dims[0]"
        :previewHeight="dims[1]"
      />
    </div>
  </section>
</template>

<style scoped>
.previews {
  display: flex;
  justify-content: center;
  gap: 2rem;
  height: 14rem;
}
</style>
