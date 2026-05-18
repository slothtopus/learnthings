<script setup lang="ts">
import { useCardController } from '../useCardController'
const { controller } = useCardController()
</script>

<template>
  <button class="wgt-btn wgt-btn-primary" @click="controller.next()">Next</button>
</template>
