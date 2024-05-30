import type { ExcludeMethods } from './utils'

export class CardTemplate {
  name: string
  frontTemplate: string
  backTemplate: string

  constructor({ name, frontTemplate, backTemplate }: ExcludeMethods<CardTemplate>) {
    this.name = name
    this.frontTemplate = frontTemplate
    this.backTemplate = backTemplate
  }
}
