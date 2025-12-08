<script setup lang="ts">
import { defineComponent, toRef, toRefs, compile, provide, watchEffect, shallowRef } from 'vue'
import type { PropType, Component } from 'vue'

import ShadowDom from './ShadowDom.vue'

import { WIDGET_COMPONENTS } from './widgets/src/useWidgets'
import { CardController } from './useCardController'
import type { CardEvents } from './useCardController'
import type { RenderedCard } from 'core/CardTemplate.js'

interface Props {
  card?: RenderedCard
  widgetSettings?: Record<string, any>
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
      provide('ctx', toRef(props, 'ctx'))
      return { ...toRefs(props) }
    },
    render,
  })
}

const compiledComponent = shallowRef<Component | undefined>(undefined)
watchEffect(() => {
  compiledComponent.value = makeRuntimeComponent(props.card?.html ?? '', WIDGET_COMPONENTS)
})
</script>

<template>
  <div>
    <ShadowDom :css="card?.css" class-name="w-full h-full dark">
      <component
        v-if="card"
        :is="compiledComponent"
        :ctx="{
          controller: new CardController(emit),
          context: card.context,
          settings: widgetSettings,
        }"
      />
    </ShadowDom>
  </div>
</template>

<style scoped></style>
