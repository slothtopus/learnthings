import { nanoid } from 'nanoid'
import { cloneDeep } from 'lodash-es'
import type { PersistableObject } from './loader'

export const generateId = (conflict = false) => (conflict ? 'same' : nanoid(6))

let _db: IDBDatabase | undefined = undefined
export const getDatabase = async () => {
  if (_db === undefined) {
    const request = indexedDB.open('learnthings')
    console.log('getDatabase: request = ', request)
    _db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = (event: Event) => {
        console.log('getDatabase.onsuccess', event)
        const target = event.target as IDBRequest
        const db = target.result as IDBDatabase
        resolve(db)
      }
      request.onupgradeneeded = (event: Event) => {
        console.log('getDatabase.onupgradeneeded', event)
        const target = event.target as IDBRequest
        const db = target.result as IDBDatabase
        db.createObjectStore('allObjects', { keyPath: 'id' })
      }
      request.onerror = reject
    })
    console.log('getDatabase.db = ', _db)
  }
  return _db
}

export const getObjectStore = async () => {
  const db = await getDatabase()
  const transaction = db.transaction('allObjects', 'readwrite')
  const objectStore = transaction.objectStore('allObjects')
  return objectStore
}

export const getOne = async <T extends { id: string }>(
  id: string,
  objectStore?: IDBObjectStore
) => {
  console.log(`getOne called for ${id}`)
  /*const db = await getDatabase()
  const transaction = db.transaction('allObjects')*/
  if (objectStore === undefined) {
    objectStore = await getObjectStore()
  }
  const obj = await new Promise<T>((resolve, reject) => {
    const request = objectStore.get(id)
    request.onsuccess = () => {
      console.log(`loader(${id}).onsuccess = `, request.result)
      if (request.result !== undefined) {
        resolve(request.result as T)
      } else {
        reject(`Object with id ${id} not found`)
      }
    }
    request.onerror = reject
  })
  return obj
}

export const persistOne = async <T extends PersistableObject>(
  obj: T,
  objectStore?: IDBObjectStore
) => {
  console.log('persistOne called for', obj)
  if (objectStore === undefined) {
    objectStore = await getObjectStore()
  }
  await wrapRequest(objectStore.put(cloneDeep(obj.serialise())))
}

export const createOne = async <T extends PersistableObject>(
  obj: T,
  objectStore?: IDBObjectStore
): Promise<T> => {
  console.log('createOne(', obj, ')')
  if (objectStore === undefined) {
    objectStore = await getObjectStore()
  }

  try {
    await wrapRequest(objectStore.add(cloneDeep(obj.serialise())))
  } catch (err: any) {
    console.log('caught error:', err)
    if (err.target.error.name == 'ConstraintError') {
      const newId = generateId()
      console.log(`Key ${obj.id} already exists; trying new key ${newId}`)
      obj.id = newId
      return await createOne(obj)
    } else {
      console.error(err)
      throw err
    }
  }
  return obj
}

export const deleteOne = async (id: string, objectStore?: IDBObjectStore): Promise<boolean> => {
  if (objectStore === undefined) {
    objectStore = await getObjectStore()
  }
  const obj = await getOne(id, objectStore)
  console.log('deleteOne: got obj', obj)
  const embeddedIds = Object.keys(obj).filter((k) => k.endsWith('_id'))
  console.log('had embeddedIds:', embeddedIds)

  await Promise.all([
    wrapRequest(objectStore.delete(obj.id)).then(() => console.log(`obj id ${obj.id} deleted`)),
    ...embeddedIds.map((embeddedId) => deleteOne(embeddedId, objectStore))
  ])
  return true
}

export const wrapRequest = (request: IDBRequest) =>
  new Promise((resolve, reject) => {
    request.onsuccess = resolve
    request.onerror = reject
  })

export const clearAll = async () => {
  const objectStore = await getObjectStore()
  objectStore.clear()
}
