<script setup lang="ts">
</script>

<template>
  <header class="fixed h-15 top-0 w-full z-50 bg-surface-container-lowest/80 backdrop-blur-md border-b border-white/5 flex items-center">
    <div class="px-8 max-w-6xl mx-auto w-full flex items-center justify-between">
      <h1 class="font-bold tracking-widest uppercase text-sm text-on-surface-variant">
        <slot>[ Nav placeholder ]</slot>
      </h1>
      <div class="flex items-center gap-1">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>
