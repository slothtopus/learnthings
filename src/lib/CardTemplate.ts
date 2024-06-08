import type { Deck } from './Deck'
import type { DexiePersistableObject } from './dexieDB'
import type { ExcludeMethods } from './utils'
import { nanoid } from 'nanoid'

export type SerialisedCardTemplate = Omit<ExcludeMethods<CardTemplate>, '_parentDeck'>

export class CardTemplate implements DexiePersistableObject {
  id: number
  name: string
  frontTemplate: string
  backTemplate: string

  _parentDeck: Deck

  static createNewDefault(parentDeck: Deck, name?: string) {
    return new CardTemplate(parentDeck, {
      id: parentDeck.getNextInternalId(),
      name: name || 'New card template',
      frontTemplate: '',
      backTemplate: ''
    })
  }

  constructor(parentDeck: Deck, { id, name, frontTemplate, backTemplate }: SerialisedCardTemplate) {
    this._parentDeck = parentDeck
    this.id = id
    this.name = name
    this.frontTemplate = frontTemplate
    this.backTemplate = backTemplate
  }

  setName(name: string) {
    this.name = name
    this.persist()
  }

  setFrontTemplate(template: string) {
    this.frontTemplate = template
    this.persist()
  }

  setBackTemplate(template: string) {
    this.backTemplate = template
    this.persist()
  }

  serialise(): SerialisedCardTemplate {
    return {
      id: this.id,
      name: this.name,
      frontTemplate: this.frontTemplate,
      backTemplate: this.backTemplate
    }
  }

  async persist() {
    await this._parentDeck.persist()
  }
}
