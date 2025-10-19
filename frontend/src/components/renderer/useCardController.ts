import { inject } from 'vue'

export type CardEvents = {
  'card:next': []
  'card:reveal': []
  'card:rate': [val: number]
  'context:add': [val: Record<string, any>]
}

// One generic signature that narrows per call site
export type TypedEmit<E extends Record<string, readonly unknown[]>> = <K extends keyof E & string>(
  evt: K,
  ...args: E[K]
) => void

export class CardController {
  emit: TypedEmit<CardEvents>
  constructor(emit: TypedEmit<CardEvents>) {
    this.emit = emit
  }

  next() {
    console.log('CardController.next')
    this.emit('card:next')
  }

  reveal() {
    console.log('CardController.reveal')
    this.emit('card:reveal')
  }

  rate(score: number) {
    this.emit('card:rate', score)
  }

  addContext(context: Record<string, any>) {
    this.emit('context:add', context)
  }
}

export const useCardController = () => {
  const ctx = inject<{ controller: CardController }>('ctx')
  if (ctx === undefined) {
    throw new Error(`ctx is undefined`)
  }
  return { controller: ctx.controller }
}
