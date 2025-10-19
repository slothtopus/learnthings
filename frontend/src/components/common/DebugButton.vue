<script setup lang="ts">
import { ref, useAttrs } from 'vue'
import { Dialog, Button } from 'primevue'

import { useRouteMetaObjects } from '@/composables/useRouteObjects'

const { getDeckIfExists } = useRouteMetaObjects()
const deck = getDeckIfExists()

const showDialog = ref(false)
const attrs = useAttrs()
</script>

<template>
  <Button
    icon="pi pi-cog"
    rounded
    :disabled="deck === undefined"
    :severity="deck === undefined ? 'contrast' : 'primary'"
    :outlined="deck === undefined"
    size="small"
    aria-haspopup="true"
    aria-controls="account-menu"
    @click="showDialog = true"
    v-bind="attrs"
  />
  <Dialog
    v-if="deck !== undefined"
    v-model:visible="showDialog"
    modal
    header="Object Manager"
    class="mx-4"
  >
    <section class="text-sm mb-4">dirtyIds: {{ deck.objectManager.dirtyIds }}</section>
    <section class="text-sm mb-4">version: {{ deck.objectManager.version }}</section>
    <div class="flex flex-col gap-4">
      <section
        class="flex gap-2 text-sm flex-wrap p-2 border-1 border-gray-600 overflow-auto"
        v-for="obj in deck.objectManager.getAllObjects()"
        :key="obj.id"
      >
        <span>{{ obj.doctype }}:{{ obj.subtype }}</span>
        <span>id: {{ obj.id }}</span>
        <span>rootId: {{ obj.rootId }}</span>
        <span>obj.shouldPersist(): {{ obj.shouldPersist() }}</span>
        <span>obj.shouldDelete(): {{ obj.shouldDelete() }}</span>
        <span>obj.isOrphaned(): {{ obj.isOrphaned() }}</span>
        <span>obj.isUnsaved(): {{ obj.isUnsaved() }}</span>
        <span>obj.isEmbedded(): {{ obj.isEmbedded() }}</span>
        <span>obj.hasChanged(): {{ obj.hasChanged() }}</span>
        <span>obj.hasAttachment(): {{ obj.hasAttachment() }}</span>
      </section>
    </div>
  </Dialog>
</template>

<style scoped></style>
