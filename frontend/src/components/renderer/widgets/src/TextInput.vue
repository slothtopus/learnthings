<script setup lang="ts">
import { ref } from 'vue'

import Button from './ui/StandardButton.vue'
import InputText from './ui/InputText.vue'

import { pause } from '@/lib/utils'
import { useCardController } from '../../useCardController'

interface Props {
  answer: string
}
const props = defineProps<Props>()

const inputText = ref('')
const { controller } = useCardController()

const isAnswered = ref(false)
const handleCheck = async () => {
  isAnswered.value = true
  await pause(200)
  const isCorrect = compareText(inputText.value, props.answer)
  controller.rate(isCorrect ? 0.75 : 0)
  controller.addContext({ 'textinput:answer': inputText.value, 'textinput:correct': isCorrect })
  controller.reveal()
}

const stripPunctuation = (text: string) => {
  return text.replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, '')
}

const removeDiacritics = (input: string): string => {
  return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const compareText = (original: string, answer: string) => {
  return (
    removeDiacritics(stripPunctuation(original)).toLowerCase().trim() ==
    removeDiacritics(stripPunctuation(answer)).toLowerCase().trim()
  )
}
</script>

<template>
  <div
    class="grid grid-rows-[4rem_auto] place-items-center gap-4 transition-opacity"
    :class="{ 'opacity-0': isAnswered }"
  >
    <InputText v-model="inputText" class="w-full" />
    <Button @click="handleCheck" :disabled="inputText.length == 0">Check</Button>
  </div>
</template>

<style scoped></style>
