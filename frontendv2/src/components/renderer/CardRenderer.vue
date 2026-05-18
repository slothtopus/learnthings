<script setup lang="ts">
import { defineComponent, toRef, toRefs, compile, provide, watchEffect, shallowRef, ref } from 'vue'
import type { PropType, Component } from 'vue'
import ShadowDom from './ShadowDom.vue'
import { WIDGET_COMPONENTS } from './widgets/index'
import { CardController } from './useCardController'
import type { CardEvents } from './useCardController'
import { RenderedCard } from 'core/CardTemplate.js'
import type { CardTemplate, CardTemplateVariant } from 'core/CardTemplate.js'
import type { Note } from 'core/Note.js'

interface Props {
  cardTemplate: CardTemplate
  variant?: CardTemplateVariant
  side?: 'front' | 'back'
  note?: Note
  widgetSettings?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), { side: 'front' })
const emit = defineEmits<CardEvents>()

const renderedCard = ref<RenderedCard>(new RenderedCard({ html: '', css: '', context: {} }))

watchEffect(async () => {
  const variant = props.variant ?? props.cardTemplate.getDefaultVariant()
  const template = props.side === 'back' ? variant.back : variant.front
  const css = variant.css  // read before first await so watchEffect tracks it

  let context: Record<string, string> = {}
  if (props.note) {
    context = await props.cardTemplate.renderAllFieldContent(props.note)
  } else {
    for (const field of props.cardTemplate.noteType.getAllFields()) {
      context[field.name] = field.name
    }
  }

  renderedCard.value = await props.cardTemplate.renderCard(template, css, context)
})

function makeRuntimeComponent(template: string, components = {}) {
  const render = compile(template)
  return defineComponent({
    name: 'RuntimeCompiled',
    components,
    props: {
      ctx: { type: Object as PropType<Record<string, unknown>>, required: true },
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
  compiledComponent.value = makeRuntimeComponent(renderedCard.value.html, WIDGET_COMPONENTS)
})
</script>

<template>
  <div style="width: 100%; height: 100%;">
    <ShadowDom :css="renderedCard.css">
      <component
        v-if="compiledComponent"
        :is="compiledComponent"
        :ctx="{
          controller: new CardController(emit),
          context: renderedCard.context,
          settings: widgetSettings,
        }"
      />
    </ShadowDom>
  </div>
</template>
