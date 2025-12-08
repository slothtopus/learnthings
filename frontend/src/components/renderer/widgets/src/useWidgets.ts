import { inject, computed } from 'vue'

import { DEFAULT_SETTINGS as NEXT_BUTTON_DEFAULT_SETTINGS } from './NextButton/NextButton.settings'
import NextButton from './NextButton/NextButton.vue'
import NextButtonSettingsForm from './NextButton/NextButtonSettingsForm.vue'

import { DEFAULT_SETTINGS as REVEAL_BUTTON_DEFAULT_SETTINGS } from './RevealButton/RevealButton.settings'
import RevealButton from './RevealButton/RevealButton.vue'
import RevealButtonSettingsForm from './RevealButton/RevealButtonSettingsForm.vue'

import { DEFAULT_SETTINGS as TEXT_INPUT_DEFAULT_SETTINGS } from './TextInput/TextInput.settings'
import TextInput from './TextInput/TextInput.vue'
import TextInputSettingsForm from './TextInput/TextInputSettingsForm.vue'

import { CardWidgetSettings, type CardTemplateVariant } from 'core/CardTemplate.js'

import { useDynamicFormDialog } from '@/composables/useFormDialog'
import RatingButtons from './RatingButtons/RatingButtons.vue'

export const WIDGETS = computed(() => ({
  'next-button': {
    name: 'Next Button',
    component: NextButton,
    defaultSettings: NEXT_BUTTON_DEFAULT_SETTINGS,

    formComponent: NextButtonSettingsForm,
  },
  'reveal-button': {
    name: 'Reveal Button',
    component: RevealButton,
    defaultSettings: REVEAL_BUTTON_DEFAULT_SETTINGS,

    formComponent: RevealButtonSettingsForm,
  },
  'text-input': {
    name: 'Text Input',
    component: TextInput,
    defaultSettings: TEXT_INPUT_DEFAULT_SETTINGS,
    formComponent: TextInputSettingsForm,
  },
  'rating-buttons': {
    name: 'Rating Buttons',
    component: RatingButtons,
    defaultSettings: null,
    formComponent: null,
  },
}))

export const WIDGET_COMPONENTS = {
  NextButton,
  RevealButton,
  TextInput,
  RatingButtons,
}

export const useWidgetSettings = <K extends keyof typeof WIDGETS.value>(key: K) => {
  const ctx = inject<any>('ctx')

  const settings = computed<(typeof WIDGETS.value)[K]['defaultSettings']>(
    () => ctx.value.settings?.[key] ?? WIDGETS.value[key].defaultSettings,
  )
  return { ctx, settings }
}

export const useWidgetSettingsMenu = () => {
  const { openDialog } = useDynamicFormDialog()
  const generateWidgetSettingsMenu = (variant: CardTemplateVariant) => {
    return Object.keys(WIDGETS.value).flatMap((slug) => {
      const { name, defaultSettings, formComponent } =
        WIDGETS.value[slug as keyof typeof WIDGETS.value]
      if (!defaultSettings || !formComponent) {
        return []
      }
      return [
        {
          label: name,
          command: async () => {
            const widgetSettings = variant.getOrCreateWidgetSettings(slug, defaultSettings)
            //console.log('widgetSettings BEFORE', widgetSettings.serialise())
            const result = await openDialog(
              formComponent,
              `${name} settings`,
              widgetSettings.settings,
            )
            if (!result.cancelled) {
              widgetSettings.updateSettings(result.data)
              //console.log('widgetSettings AFTER UPDATE', widgetSettings.serialise())
            }
            await widgetSettings.deck.persist()
            widgetSettings.objectManager.updateVersion(CardWidgetSettings.doctype)
            //console.log('widgetSettings AFTER PERSIST', widgetSettings.serialise())
          },
        },
      ]
    })
  }

  return { generateWidgetSettingsMenu }
}
