<script setup lang="ts">
import { ref, computed } from 'vue'
import { Dialog, InputText, Checkbox } from 'primevue'

import ObjectCard from './ObjectCard.vue'
import type { Deck } from 'core/Deck.js'

interface Props {
  deck: Deck
}
const props = defineProps<Props>()

const showDialog = ref(false)

const filterShouldPersist = ref(false)
const filterShouldDelete = ref(false)
const filterIsDirty = ref(false)
const filterText = ref('')

const filteredObjects = computed(() =>
  props.deck.objectManager.getAllObjects().filter((obj) => {
    let include = true

    if (filterText.value.length > 0) {
      const text = `${obj.doctype}:${obj.subtype}`
      include = include && (text.includes(filterText.value) || obj.id.includes(filterText.value))
    }
    if (filterShouldPersist.value) {
      include = include && obj.shouldPersist()
    }
    if (filterShouldDelete.value) {
      include = include && obj.shouldDelete()
    }
    if (filterIsDirty.value) {
      include = include && obj.objectManager.dirtyIds.has(obj.id)
    }

    return include
  }),
)
</script>

<template>
  <Dialog
    v-if="deck !== undefined"
    v-model:visible="showDialog"
    modal
    header="Object Manager"
    class="mx-4"
  >
    <section class="text-sm mb-4">
      <h2 class="text-gray-400 text-base">dirtyIds:</h2>
      {{ deck.objectManager.dirtyIds }}
    </section>
    <section class="text-sm mb-4">
      <h2 class="text-gray-400 text-base">version:</h2>
      {{ deck.objectManager.version }}
    </section>

    <div class="w-full py-4 sticky top-0 bg-(--p-dialog-background)">
      <InputText v-model="filterText" class="w-100" />
      <div class="flex gap-6 mt-3">
        <div class="flex items-center gap-2">
          <Checkbox v-model="filterShouldPersist" binary />
          <label> shouldPersist </label>
        </div>
        <div class="flex items-center gap-2">
          <Checkbox v-model="filterShouldDelete" binary />
          <label> shouldDelete </label>
        </div>
        <div class="flex items-center gap-2">
          <Checkbox v-model="filterIsDirty" binary />
          <label> isDirty </label>
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-4">
      <ObjectCard v-for="obj in filteredObjects" :key="obj.id" :obj="obj" />
    </div>
  </Dialog>
</template>

<style scoped></style>
