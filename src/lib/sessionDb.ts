import { DB_NAME, DB_VERSION } from './constants'
import type { SessionRecord } from '../types/session'

const STORE_NAME = 'sessions'

export function openSessionDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
        store.createIndex('dateKey', 'dateKey', { unique: false })
        store.createIndex('endedAt', 'endedAt', { unique: false })
        store.createIndex('category', 'category', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'))
  })
}

export function getAllSessions(db: IDBDatabase): Promise<SessionRecord[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).getAll()

    request.onsuccess = () => resolve((request.result as SessionRecord[]) ?? [])
    request.onerror = () => reject(request.error ?? new Error('Failed to read sessions'))
  })
}

export function addSession(db: IDBDatabase, session: SessionRecord): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).add(session)

    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('Failed to save session'))
  })
}
