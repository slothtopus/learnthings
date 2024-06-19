<script setup lang="ts">
/*defineEmits<{
  resolve: [value: string]
}>()*/
</script>

<template>
  <div>
    <p>Hello</p>
    <button @click="$emit('resolve', 'dfgfdmslgjklfsdglfd')">click</button>
  </div>
</template>

<style scoped></style>
