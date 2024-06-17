<script setup lang="ts">
import { ref, computed } from 'vue'

import { Button } from '@/components/shadcn-ui/button'

import ShadowDom from '@/components/ShadowDom.vue'
import type { Card, Scheduler } from '@/lib/Scheduler'

import { useRouter } from 'vue-router'

interface Props {
  scheduler: Scheduler
  card: Card
}
const props = defineProps<Props>()

const reveal = ref(false)
const card = computed(() => (reveal.value ? props.card.render('back') : props.card.render('front')))

defineEmits<{
  answer: [value: number]
}>()

const router = useRouter()
const handleAnswer = (value: number) => {
  props.scheduler.answer(props.card, value)
  router.push({ name: 'study', params: props.scheduler.getNextCardIds() })
}
</script>

<template>
  <ShadowDom class="fullscreen" :html="card.html" :css="card.css" />
  <div class="controller">
    <template v-if="!reveal">
      <Button @click="reveal = true" variant="secondary">Reveal</Button>
    </template>
    <template v-else>
      <Button variant="secondary" @click="handleAnswer(1)">Correct</Button>
      <Button variant="secondary" @click="handleAnswer(0)">Incorrect</Button>
    </template>
  </div>
</template>

<style scoped>
.fullscreen {
  width: 100%;
  height: 100%;
}

.controller {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
}

.controller > * + * {
  margin-left: 1rem;
}
</style>
