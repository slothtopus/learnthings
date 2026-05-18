import { GoogleTextToSpeech } from 'core/generators/GoogleTextToSpeech.js'
import type { ReactiveObjectManager } from './ReactiveObjectManager'
import { tokenGenerator } from '@/lib/auth'
import { isInstanceOrThrow } from './utils'

export const registerServiceObjects = (om: ReactiveObjectManager) => {
  om.register(GoogleTextToSpeech)
}

type Ctor<T> = abstract new (...args: any[]) => T

export type RegisteredService<T> = {
  cls: Ctor<T>
  createNew: (om: ReactiveObjectManager) => T
  injectDependencies: (obj: T) => T
}

export const defineService = <T>(service: RegisteredService<T>) => service

export const SERVICE_REGISTRY = {
  'google-tts': defineService({
    createNew: (om: ReactiveObjectManager) => {
      const obj = GoogleTextToSpeech.createNew(om, {
        apiUrl: import.meta.env['VITE_GENERATION_API_URL'],
      })
      om.setObject(obj)
      return obj
    },
    injectDependencies: (obj) => {
      obj.tokenGenerator = tokenGenerator
      return isInstanceOrThrow(obj, GoogleTextToSpeech)
    },
    cls: GoogleTextToSpeech,
  }),
} satisfies Record<string, RegisteredService<any>>

export type ServiceKey = keyof typeof SERVICE_REGISTRY
