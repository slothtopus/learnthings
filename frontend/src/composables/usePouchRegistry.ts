import { PouchDeckRegistry } from 'core/service/registry.js'

const registry = new PouchDeckRegistry(
  import.meta.env['VITE_COUCH_HOST'],
  {
    username: import.meta.env['VITE_COUCH_USERNAME'],
    password: import.meta.env['VITE_COUCH_PASSWORD'],
  },
  'guest',
  import.meta.env['VITE_MEMORY_ONLY'] === 'true',
  false
)

export const usePouchRegistry = () => {
  return { registry }
}
