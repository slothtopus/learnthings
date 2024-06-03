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

export const getOne = async <T>(id: string) => {
  console.log(`loader called for ${id}`)
  const db = await getDatabase()
  const transaction = db.transaction('allObjects')
  const obj = await new Promise<T>((resolve, reject) => {
    const objectStore = transaction.objectStore('allObjects')
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

export const persistOne = async (obj: any) => {
  console.log('persistOne called for', obj)
  const db = await getDatabase()
  console.log('persistOne.db =', db)
  const transaction = db.transaction('allObjects', 'readwrite')
  const objectStore = transaction.objectStore('allObjects')
  await new Promise((resolve, reject) => {
    const request = objectStore.put(obj)
    request.onsuccess = resolve
    request.onerror = reject
  })
}
