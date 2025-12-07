import { inject, computed } from 'vue'

import { DEFAULT_SETTINGS as NEXT_BUTTON_DEFAULT_SETTINGS } from './NextButton/NextButton.settings'
import NextButton from './NextButton/NextButton.vue'
import NextButtonSettingsForm from './NextButton/NextButtonSettingsForm.vue'

import { DEFAULT_SETTINGS as REVEAL_BUTTON_DEFAULT_SETTINGS } from './RevealButton/RevealButton.settings'
import RevealButton from './RevealButton/RevealButton.vue'
import RevealButtonSettingsForm from './RevealButton/RevealButtonSettingsForm.vue'

import { CardWidgetSettings, type CardTemplateVariant } from 'core/CardTemplate.js'

import { useDynamicFormDialog } from '@/composables/useFormDialog'


export const WIDGETS = computed(() => ({
  'next-button': {
    name: 'Next Button',
    defaultSettings: NEXT_BUTTON_DEFAULT_SETTINGS,
    component: NextButton,
    formComponent: NextButtonSettingsForm,
  },
  'reveal-button': {
    name: 'Reveal Button',
    defaultSettings: REVEAL_BUTTON_DEFAULT_SETTINGS,
    component: RevealButton,
    formComponent: RevealButtonSettingsForm,
  },
}))

export const useWidgetSettings = <K extends keyof typeof WIDGETS.value>(key: K) => {
  const ctx = inject<any>('ctx')
  const settings = computed<(typeof WIDGETS.value)[K]['defaultSettings']>(
    () => ctx.value.settings?.[key] ?? WIDGETS.value[key].defaultSettings,
  )
  return {ctx, settings }
}

export const useWidgetSettingsMenu = () => {
  const { openDialog } = useDynamicFormDialog()
  const generateWidgetSettingsMenu = (variant: CardTemplateVariant) => {
    return Object.keys(WIDGETS.value).map((slug) => {
      const { name, defaultSettings, formComponent } = WIDGETS.value[slug as keyof typeof WIDGETS.value]
      return {
        label: name,
        command: async () => {
          const widgetSettings = variant.getOrCreateWidgetSettings(slug, defaultSettings)
          console.log('widgetSettings BEFORE', widgetSettings.serialise())
          const result = await openDialog(
            formComponent,
            `${name} settings`,
            widgetSettings.settings,
          )
          if (!result.cancelled) {
            widgetSettings.updateSettings(result.data)
            console.log('widgetSettings AFTER UPDATE', widgetSettings.serialise())
          }
          await widgetSettings.deck.persist()
          widgetSettings.objectManager.updateVersion(CardWidgetSettings.doctype)
          console.log('widgetSettings AFTER PERSIST', widgetSettings.serialise())
        },
      }
    })
  }

  return { generateWidgetSettingsMenu }
}
