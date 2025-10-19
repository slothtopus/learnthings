<script setup lang="ts">
import Button from './ui/StandardButton.vue'
import { useCardController } from '../../useCardController'

const { controller } = useCardController()
</script>

<template>
  <Button @click="controller.next()">Next</Button>
</template>
