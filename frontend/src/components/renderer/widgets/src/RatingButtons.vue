<script setup lang="ts">
import Button from './ui/StandardButton.vue'
import InfoButton from './ui/InfoButton.vue'
import DangerButton from './ui/DangerButton.vue'
import WarningButton from './ui/WarningButton.vue'

import { useCardController } from '../../useCardController'

const { controller } = useCardController()

const handleRated = (score: number) => {
  controller.rate(score)
  controller.next()
}
</script>

<template>
  <div class="flex gap-4">
    <DangerButton severity="danger" @click="handleRated(0)">Again</DangerButton
    ><WarningButton severity="warn" @click="handleRated(0.25)">Hard</WarningButton
    ><InfoButton severity="info" @click="handleRated(0.5)">Good</InfoButton
    ><Button severity="success" @click="handleRated(1)">Easy</Button>
  </div>
</template>

<style scoped></style>
