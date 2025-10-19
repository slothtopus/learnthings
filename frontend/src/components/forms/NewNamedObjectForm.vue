<script setup lang="ts">
import { ref, inject } from 'vue'

import { InputText, Button } from 'primevue'

const deckName = ref('')

const dialogRef = inject<{ data: { title: string } }>('dialogRef')

defineEmits<{
  create: [name: string]
  cancel: [value: void]
}>()
</script>

<template>
  <div>
    <label for="new-deck-name" class="font-thin block mb-2">{{ dialogRef?.data.title }}</label>
    <InputText
      v-model="deckName"
      inputId="new-deck-name"
      mode="decimal"
      showButtons
      :min="0"
      :max="100"
      fluid
    />
  </div>
  <div class="mt-6 flex gap-4 justify-end">
    <Button
      label="Create"
      :disabled="deckName.length == 0"
      size="small"
      @click="$emit('create', deckName)"
    />
    <Button label="Cancel" size="small" severity="secondary" @click="$emit('cancel')" />
  </div>
</template>

<style scoped></style>
