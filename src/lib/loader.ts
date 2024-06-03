import { debounce } from 'lodash-es'

export interface PersistanceServiceInterface<T extends PersistableObject> {
  getOne: (id: string) => Promise<T>
  persistOne: (obj: T) => Promise<void>
}

export interface PersistableObject {
  id: string
  persist: () => Promise<void>
  serialise: () => any
}

export const PROXY_MARKER = Symbol('proxyMarker')
export const markAsProxied = (obj: any) => {
  obj[PROXY_MARKER] = true
}

export const isAlreadyProxied = (obj: any) => obj[PROXY_MARKER] === true

const wrapNestedObject = (obj: any, delay: number, debouncedPersist: any): any => {
  if (typeof obj === 'object' && obj !== null && !isAlreadyProxied(obj)) {
    return wrapPersistanceProxy(obj, delay, debouncedPersist)
  }
  return obj
}

export const wrapPersistanceProxy = <T extends PersistableObject>(
  obj: T,
  delay = 1000,
  debouncedPersist?: any
): T => {
  if (isAlreadyProxied(obj)) {
    return obj
  }

  debouncedPersist =
    debouncedPersist ||
    debounce(() => {
      obj.persist()
    }, delay)

  const handler: ProxyHandler<T> = {
    set: (target: T, prop: string | symbol, value: any) => {
      if (typeof value === 'object' && value !== null) {
        value = wrapNestedObject(value, delay, debouncedPersist)
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
      obj[key] = wrapNestedObject(obj[key], delay, debouncedPersist)
    }
  }

  const proxy = new Proxy(obj, handler)
  markAsProxied(proxy)

  return proxy
}

export class AsyncLoader<T extends PersistableObject> {
  id: string
  _isLoading = false
  _isReady = false
  _loader: undefined | ((id: string) => Promise<T>) = undefined
  _data: undefined | T = undefined

  constructor(id: string, { loader, data }: { loader?: (id: string) => Promise<T>; data?: T }) {
    this.id = id
    if (loader !== undefined) {
      this._loader = loader
    }
    if (data !== undefined) {
      this._data = wrapPersistanceProxy(data)
      this._isReady = true
    }
  }

  get data() {
    if (this._data === undefined && !this._isLoading) {
      this.loadData()
    }
    return this._data
  }

  get isLoading() {
    return this._isLoading
  }

  get isReady() {
    return this._isReady
  }

  async loadData() {
    if (this._loader === undefined) {
      throw new Error('loader is not defined!')
    }
    try {
      this._isLoading = true
      this._data = wrapPersistanceProxy(await this._loader(this.id))
      this._isReady = true
    } catch (err) {
      console.error(err)
    } finally {
      this._isLoading = false
    }
  }
}

export class AsyncCollection<T extends PersistableObject> {
  ids: string[] = []
  _objects: Record<string, AsyncLoader<T>> = {}

  static fromData<T extends PersistableObject>(objs: T[]) {
    return new AsyncCollection(
      objs.map((o) => o.id),
      { data: objs }
    )
  }

  constructor(
    ids: string[],
    { loader, data }: { loader?: (id: string) => Promise<T>; data?: T[] }
  ) {
    this.ids = ids
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
