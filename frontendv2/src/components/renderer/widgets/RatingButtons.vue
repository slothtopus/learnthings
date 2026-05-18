<script setup lang="ts">
import { useCardController } from '../useCardController'
const { controller } = useCardController()

const rate = (score: number) => {
  controller.rate(score)
  controller.next()
}
</script>

<template>
  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
    <button class="wgt-btn wgt-btn-danger" @click="rate(0)">Again</button>
    <button class="wgt-btn wgt-btn-warning" @click="rate(0.25)">Hard</button>
    <button class="wgt-btn wgt-btn-info" @click="rate(0.5)">Good</button>
    <button class="wgt-btn wgt-btn-primary" @click="rate(1)">Easy</button>
  </div>
</template>
