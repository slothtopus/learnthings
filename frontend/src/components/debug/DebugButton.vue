<script setup lang="ts">
import { ref, useAttrs } from 'vue'
import { Button } from 'primevue'

import DebugDialog from './DebugDialog.vue'

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
  <DebugDialog
    v-if="deck !== undefined"
    :deck="deck"
    v-model:visible="showDialog"
    modal
    header="Object Manager"
    class="mx-4"
  />
</template>

<style scoped></style>
