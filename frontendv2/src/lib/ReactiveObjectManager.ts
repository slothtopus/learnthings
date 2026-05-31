import { reactive } from 'vue'

import { ObjectManager } from 'core/object_manager/ObjectManager.js'

import { Deck } from 'core/Deck.js'
import { NoteType } from 'core/NoteType.js'
import { Note } from 'core/Note.js'
import { Card } from 'core/Card.js'

import {
  TextField,
  TextFieldContent,
  ImageAttachmentField,
  ImageAttachmentContent,
  AudioAttachmentField,
  AudioAttachmentContent
} from 'core/fields/fields.js'
import { TextToSpeechField, TextToSpeechFieldContent } from 'core/fields/generated.js'
import { FSRSScheduler } from 'core/schedulers/FSRSScheduler.js'
import { FSRSSequence } from 'core/schedulers/FSRSSequence.js'
import {
  CardTemplate,
  CardTemplateBlock,
  CardTemplateVariant,
  CardWidgetSettings,
  CardTemplateAttachment,
} from 'core/CardTemplate.js'

export class ReactiveObjectManager extends ObjectManager {
  objectsById = reactive({})
  version = reactive({ default: 0 })

  resetObjects(): void {
    this.objectsById = reactive({})
  }
}

export const registerObjects = (om: ObjectManager) => {
  om.register(Deck)
    .register(NoteType)
    .register(Note)
    .register(Card)
    .register(TextField)
    .register(TextFieldContent)
    .register(ImageAttachmentField)
    .register(ImageAttachmentContent)
    .register(FSRSScheduler)
    .register(FSRSSequence)
    .register(CardTemplate)
    .register(CardTemplateBlock)
    .register(CardTemplateVariant)
    .register(CardWidgetSettings)
    .register(CardTemplateAttachment)
    .register(TextToSpeechField)
    .register(TextToSpeechFieldContent)
    .register(AudioAttachmentField)
    .register(AudioAttachmentContent)
}
