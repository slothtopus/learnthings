<script setup lang="ts">
import type { FSRSSequence } from 'core/schedulers/FSRSSequence.js'
import { Button } from 'primevue'
import { DateTime } from 'luxon'

interface Props {
  scheduler: FSRSSequence
}
const props = defineProps<Props>()

const emit = defineEmits(['start'])

const handleStartReview = () => {
  props.scheduler.initialise(props.scheduler.deck.getAllCards())
  emit('start')
}
</script>

<template>
  <div class="m-auto py-8 px-4 w-full max-w-sm flex flex-col items-center">
    <h1 class="text-3xl dark:text-gray-300">{{ props.scheduler.deck.name }}</h1>
    <h2 class="text-sm dark:text-gray-300 font-thin">
      {{ DateTime.now().toFormat('EEEE d MMMM, yyyy') }}
    </h2>
    <Button class="mt-10 w-full" @click="handleStartReview">Start</Button>
  </div>
</template>

<style scoped></style>
