<script setup lang="ts">
import { useCardController } from '../useCardController'
import { useWidgetSettings } from './useWidgets'

const { controller } = useCardController()
const { settings } = useWidgetSettings('reveal-button')
</script>

<template>
  <button
    :class="settings.unstyled ? '' : 'wgt-btn wgt-btn-primary'"
    @click="controller.reveal()"
  >Reveal</button>
</template>
