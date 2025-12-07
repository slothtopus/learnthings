<script setup lang="ts">
import Button from '../ui/StandardButton.vue'
import { useCardController } from '../../../useCardController'
import { useWidgetSettings } from '../useWidgets'

const { controller } = useCardController()
const { settings } = useWidgetSettings('reveal-button')
</script>

<template>
  <button id="reveal-button" v-if="settings.unstyled" @click="controller.reveal()">Reveal</button>
  <Button id="reveal-button" v-else @click="controller.reveal()">Reveal</Button>
</template>
