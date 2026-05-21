<script setup lang="ts">
import { ref } from 'vue'
import { useCardController } from '../useCardController'
import { useWidgetSettings } from './useWidgets'

interface Props {
  answer: string
}
const props = defineProps<Props>()
const { controller } = useCardController()
const { settings } = useWidgetSettings('text-input')

const inputText = ref('')
const isAnswered = ref(false)

const prepareText = (text: string): string => {
  let result = text.toLowerCase().trim()
  if (settings.value.ignorePunctuation) {
    result = result.replace(/[^\p{L}\p{N}\s]/gu, '')
  }
  if (settings.value.ignoreDiacritics) {
    result = result.normalize('NFD').replace(/\p{M}/gu, '')
  }
  return result
}

const handleCheck = async () => {
  isAnswered.value = true
  await new Promise((r) => setTimeout(r, 200))
  const isCorrect = prepareText(inputText.value) === prepareText(props.answer)
  controller.rate(isCorrect ? 0.75 : 0)
  controller.addContext({ 'textinput:answer': inputText.value, 'textinput:correct': isCorrect })
  controller.reveal()
}
</script>

<template>
  <div
    :style="{
      display: 'grid',
      gridTemplateRows: '4rem auto',
      placeItems: 'center',
      gap: '16px',
      opacity: isAnswered ? 0 : 1,
      transition: 'opacity 0.2s',
    }"
  >
    <input
      class="wgt-input"
      v-model="inputText"
      @keyup.enter="inputText.length > 0 && handleCheck()"
    />
    <button class="wgt-btn wgt-btn-primary" :disabled="inputText.length === 0" @click="handleCheck">
      Check
    </button>
  </div>
</template>
