import { debounce, type DebouncedFunc } from 'lodash-es'
import { createOne, deleteOne, getOne, persistOne } from './db'

/*export interface PersistanceServiceInterface<T extends PersistableObject> {
  getOne: (id: string) => Promise<T>
  persistOne: (obj: T) => Promise<void>
}*/

export interface PersistableObject {
  id: string
  serialise: () => any
}

export const PROXY_MARKER = Symbol('proxyMarker')
export const markAsProxied = (obj: any) => {
  obj[PROXY_MARKER] = true
}

export const isAlreadyProxied = (obj: any) => obj[PROXY_MARKER] === true

const wrapNestedObject = (obj: any, debouncedPersist: DebouncedFunc<() => void>): any => {
  if (typeof obj === 'object' && obj !== null && !isAlreadyProxied(obj)) {
    return wrapPersistanceProxy(obj, debouncedPersist)
  }
  return obj
}

export const wrapPersistanceProxy = <T extends PersistableObject>(
  obj: T,
  debouncedPersist: DebouncedFunc<() => void>
): T => {
  if (isAlreadyProxied(obj)) {
    return obj
  }

  /*debouncedPersist =
    debouncedPersist ||
    debounce(() => {
      obj.persist()
    }, delay)*/

  const handler: ProxyHandler<T> = {
    set: (target: T, prop: string | symbol, value: any) => {
      if (typeof value === 'object' && value !== null) {
        value = wrapNestedObject(value, debouncedPersist)
      }
      target[prop as keyof T] = value
      if (typeof prop != 'symbol' && !prop.startsWith('_')) {
        console.log(`proxy handler: ${String(prop)} set to ${value} on ${target}`)
        debouncedPersist()
      }
      return true
    }
  }

  // Wrap existing nested objects
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      obj[key] = wrapNestedObject(obj[key], debouncedPersist)
    }
  }

  const proxy = new Proxy(obj, handler)
  markAsProxied(proxy)

  return proxy
}

export class AsyncCollection<T extends PersistableObject> {
  ids: string[] = []
  _objects: Record<string, AsyncLoader<T>> = {}
  _creator: (obj: T) => Promise<T> = createOne

  static fromData<T extends PersistableObject>(objs: T[]) {
    return new AsyncCollection(
      objs.map((o) => o.id),
      { data: objs }
    )
  }

  constructor(
    ids: string[],
    {
      loader,
      creator,
      data
    }: { loader?: (id: string) => Promise<T>; creator?: (obj: T) => Promise<T>; data?: T[] } = {}
  ) {
    this.ids = ids
    if (creator !== undefined) {
      this._creator = creator
    }
    this._objects = this.ids.reduce(
      (objects, id, i) => {
        objects[id] = new AsyncLoader(id, { data: data ? data[i] : undefined, loader: loader })
        return objects
      },
      {} as Record<string, AsyncLoader<T>>
    )
  }

  get objects() {
    return this.ids.map((id) => this._objects[id])
  }

  setObjects(objs: AsyncLoader<T>[]) {
    this.ids = objs.map((o) => o.id)
  }

  toIds() {
    return [...this.ids]
  }

  async unshiftNew(obj: T) {
    const createdObj = await this._creator(obj)
    console.log('unshiftNew createdObj = ', createdObj)
    this.ids.unshift(createdObj.id)
    this._objects[createdObj.id] = new AsyncLoader<T>(createdObj.id, { data: createdObj })
  }

  async delete(deleteId: string) {
    const obj = this._objects[deleteId]
    if (obj === undefined) {
      throw new Error(`Cannot delete object with id ${deleteId}: not found in collection`)
    }
    obj.delete()
    delete this._objects[deleteId]
    this.ids = this.ids.filter((id) => id != deleteId)
  }
}

export class ObjectCache<T extends PersistableObject> {
  objects: Record<string, T> = {}

  add(obj: T) {
    this.objects[obj.id] = obj
  }

  get(id: string) {
    return this.objects[id]
  }
}
