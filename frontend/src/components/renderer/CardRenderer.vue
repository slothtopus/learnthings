<script setup lang="ts">
import { defineComponent, toRefs, compile, provide, watchEffect, watch, shallowRef } from 'vue'
import type { PropType, Component } from 'vue'
import Button from './widgets/src/ui/StandardButton.vue'
import NextButton from './widgets/src/NextButton.vue'
import RevealButton from './widgets/src/RevealButton.vue'
import RatingButtons from './widgets/src/RatingButtons.vue'
import TextInput from './widgets/src/TextInput.vue'

import ShadowDom from './ShadowDom.vue'

import { CardController } from './useCardController'
import type { CardEvents } from './useCardController'
import type { RenderedCard } from 'core/CardTemplate.js'

interface Props {
  card?: RenderedCard
}

const props = defineProps<Props>()

const emit = defineEmits<CardEvents>()

function makeRuntimeComponent(template: string, components = {}) {
  const render = compile(template)

  return defineComponent({
    name: 'RuntimeCompiled',
    components,
    // declare whatever props the runtime template should “see”
    props: {
      ctx: {
        type: Object as PropType<Record<string, unknown>>,
        required: true,
      },
    },
    setup(props) {
      provide('ctx', props.ctx)
      return { ...toRefs(props) }
    },
    render,
  })
}

const compiledComponent = shallowRef<Component | undefined>(undefined)
watchEffect(() => {
  compiledComponent.value = makeRuntimeComponent(props.card?.html ?? '', {
    Button,
    NextButton,
    RevealButton,
    RatingButtons,
    TextInput,
  })
})

watch(
  () => props.card?.context,
  (newContext) => {
    console.log('card context now:', newContext)
  },
)
</script>

<template>
  <div>
    <ShadowDom :css="card?.css" class-name="w-full h-full dark">
      <component
        v-if="card"
        :is="compiledComponent"
        :ctx="{ controller: new CardController(emit), context: card.context }"
      />
    </ShadowDom>
  </div>
</template>

<style scoped></style>
