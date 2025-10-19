<script setup lang="ts">
import AppFrameBaseLayout from '@/layouts/AppFrameBaseLayout.vue'
</script>

<template>
  <AppFrameBaseLayout :breadcrumbs="[]">
    <h1>Not Found</h1>
    <p>{{ $route.meta.errorMessage || 'Something was missing' }}</p>
  </AppFrameBaseLayout>
</template>

<style scoped></style>
