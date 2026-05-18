<script setup lang="ts">
import { ref } from 'vue'
import { useCardController } from '../useCardController'

interface Props {
  answer: string
}
const props = defineProps<Props>()
const { controller } = useCardController()

const inputText = ref('')
const isAnswered = ref(false)

const handleCheck = async () => {
  isAnswered.value = true
  await new Promise((r) => setTimeout(r, 200))
  const a = inputText.value.toLowerCase().trim()
  const b = props.answer.toLowerCase().trim()
  const isCorrect = a === b
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
