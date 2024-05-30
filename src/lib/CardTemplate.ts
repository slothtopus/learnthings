import type { ExcludeMethods } from './utils'
import { nanoid } from 'nanoid'

export class CardTemplate {
  id: string
  name: string
  frontTemplate: string
  backTemplate: string

  static createNew(name?: string) {
    return new CardTemplate({
      id: nanoid(6),
      name: name || 'New card template',
      frontTemplate: '',
      backTemplate: ''
    })
  }

  constructor({ id, name, frontTemplate, backTemplate }: ExcludeMethods<CardTemplate>) {
    this.id = id
    this.name = name
    this.frontTemplate = frontTemplate
    this.backTemplate = backTemplate
  }

  setName(name: string) {
    this.name = name
  }
}
