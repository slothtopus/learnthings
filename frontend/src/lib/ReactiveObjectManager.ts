import { reactive } from 'vue'

import { ObjectManager } from 'core/ObjectManager.js'

import { Deck } from 'core/Deck.js'
import { NoteType } from 'core/NoteType.js'
import { Note } from 'core/Note.js'
import { Card } from 'core/Card.js'
import {
  AttachmentNoteField,
  AttachmentNoteFieldContent,
  TextNoteField,
} from 'core/NoteField.js'
import { TextNoteFieldContent } from 'core/NoteField.js'
import { FSRSScheduler } from 'core/FSRSScheduler.js'
import {
  CardTemplate,
  CardTemplateBlock,
  CardTemplateVariant,
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
    .register(TextNoteField)
    .register(TextNoteFieldContent)
    .register(AttachmentNoteField)
    .register(AttachmentNoteFieldContent)
    .register(FSRSScheduler)
    .register(CardTemplate)
    .register(CardTemplateBlock)
    .register(CardTemplateVariant)
}
