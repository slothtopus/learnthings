import { inject, computed } from 'vue'
import type { Ref } from 'vue'

import { useFormDialog } from '@/composables/useFormDialog'
import { CardWidgetSettings } from 'core/CardTemplate.js'
import type { CardTemplateVariant } from 'core/CardTemplate.js'

import RevealButton from './RevealButton.vue'
import NextButton from './NextButton.vue'
import RatingButtons from './RatingButtons.vue'
import TextInput from './TextInput.vue'

import { DEFAULT_SETTINGS as REVEAL_DEFAULTS } from './RevealButton.settings'
import { DEFAULT_SETTINGS as NEXT_DEFAULTS } from './NextButton.settings'
import { DEFAULT_SETTINGS as TEXT_INPUT_DEFAULTS } from './TextInput.settings'

import RevealButtonSettingsForm from './RevealButtonSettingsForm.vue'
import NextButtonSettingsForm from './NextButtonSettingsForm.vue'
import TextInputSettingsForm from './TextInputSettingsForm.vue'

export const WIDGET_COMPONENTS = {
  RevealButton,
  NextButton,
  RatingButtons,
  TextInput,
}

const WIDGET_REGISTRY = [
  {
    slug: 'reveal-button',
    name: 'Reveal Button',
    defaultSettings: REVEAL_DEFAULTS as Record<string, unknown>,
    formComponent: RevealButtonSettingsForm,
  },
  {
    slug: 'next-button',
    name: 'Next Button',
    defaultSettings: NEXT_DEFAULTS as Record<string, unknown>,
    formComponent: NextButtonSettingsForm,
  },
  {
    slug: 'text-input',
    name: 'Text Input',
    defaultSettings: TEXT_INPUT_DEFAULTS as Record<string, unknown>,
    formComponent: TextInputSettingsForm,
  },
] as const

export const useWidgetSettings = (slug: string) => {
  const ctx = inject<Ref<{ settings?: Record<string, Record<string, unknown>> }>>('ctx')
  const defaults = WIDGET_REGISTRY.find((w) => w.slug === slug)?.defaultSettings ?? {}
  const settings = computed(() => ctx?.value.settings?.[slug] ?? defaults)
  return { settings }
}

export const useWidgetSettingsMenu = () => {
  const dialogs = WIDGET_REGISTRY.map((w) => ({
    ...w,
    dialog: useFormDialog(w.formComponent),
  }))

  const generateWidgetSettingsMenu = (variant: CardTemplateVariant) =>
    dialogs.map(({ slug, name, defaultSettings, dialog }) => ({
      name,
      open: async () => {
        const widgetSettings = variant.getOrCreateWidgetSettings(slug, defaultSettings)
        const result = await dialog.open(widgetSettings.settings as Record<string, unknown>)
        if (!result.cancelled) {
          widgetSettings.updateSettings(result.data)
        }
        await widgetSettings.deck.persist()
        widgetSettings.objectManager.updateVersion(CardWidgetSettings.doctype)
      },
    }))

  return { generateWidgetSettingsMenu }
}
