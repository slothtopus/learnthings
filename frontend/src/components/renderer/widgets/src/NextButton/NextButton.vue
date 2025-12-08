<script setup lang="ts">
import Button from '../ui/StandardButton.vue'
import { useCardController } from '../../../useCardController'
import { useWidgetSettings } from '../useWidgets'

const { controller } = useCardController()
const { settings } = useWidgetSettings('next-button')
</script>

<template>
  <button v-if="settings.unstyled" @click="controller.next()"></button>
  <Button v-else @click="controller.next()">Next</Button>
</template>
