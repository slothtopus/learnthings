import type { Deck } from './Deck'
import type { NoteFieldContent } from './Note'
import type { NoteField } from './NoteField'
import type { DexiePersistableObject } from './dexieDB'
import type { ExcludeMethods } from './utils'

import Handlebars from 'handlebars'

export type SerialisedCardTemplate = Omit<ExcludeMethods<CardTemplate>, '_parentDeck'>

export class CardTemplate implements DexiePersistableObject {
  id: number
  name: string
  frontTemplate: string
  backTemplate: string
  css: string

  _parentDeck: Deck

  static createNewDefault(parentDeck: Deck, name?: string) {
    return new CardTemplate(parentDeck, {
      id: parentDeck.getNextInternalId(),
      name: name || 'New card template',
      frontTemplate: '',
      backTemplate: '',
      css: ''
    })
  }

  constructor(
    parentDeck: Deck,
    { id, name, frontTemplate, backTemplate, css }: SerialisedCardTemplate
  ) {
    this._parentDeck = parentDeck
    this.id = id
    this.name = name
    this.frontTemplate = frontTemplate
    this.backTemplate = backTemplate
    this.css = css
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

  setCSSTemplate(template: string) {
    this.css = template
    this.persist()
  }

  serialise(): SerialisedCardTemplate {
    return {
      id: this.id,
      name: this.name,
      frontTemplate: this.frontTemplate,
      backTemplate: this.backTemplate,
      css: this.css
    }
  }

  render(side: 'front' | 'back', fields: NoteField[], content: NoteFieldContent[]) {
    const template = Handlebars.compile(side == 'front' ? this.frontTemplate : this.backTemplate)
    const templateFields = fields.reduce(
      (allFields, field) => {
        allFields[field.name] = field.render(content.find((c) => c.id == field.id))
        return allFields
      },
      {} as Record<string, string>
    )
    let renderedHTML = ''
    try {
      renderedHTML = template(templateFields)
    } catch (err) {
      console.error(err)
    }
    return {
      css: this.css,
      html: `<main style="overflow: auto;">${renderedHTML}</main>`
    }
  }

  async persist() {
    await this._parentDeck.persist()
  }
}
