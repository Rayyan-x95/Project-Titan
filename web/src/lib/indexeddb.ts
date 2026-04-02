import type { TitanState } from '../types'

// Database configuration
const DB_NAME = 'titan-web-db'
const DB_VERSION = 1
const STORES = ['state'] as const

// Promise wrapper for IndexedDB operations
export class TitanDB {
  private db: IDBDatabase | null = null
  private readyPromise: Promise<void> | null = null

  constructor() {
    this.readyPromise = null
  }

  private init(): Promise<void> {
    if (this.readyPromise) {
      return this.readyPromise
    }

    if (typeof indexedDB === 'undefined') {
      this.readyPromise = Promise.resolve()
      return this.readyPromise
    }

    this.readyPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = () => {
        const db = request.result
        STORES.forEach((storeName) => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName)
          }
        })
      }

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onerror = () => {
        reject(request.error)
      }
    })

    return this.readyPromise
  }

  private async ensureReady(): Promise<IDBDatabase> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    return this.db
  }

  async saveState(state: TitanState): Promise<void> {
    if (typeof indexedDB === 'undefined') {
      return
    }

    const db = await this.ensureReady()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['state'], 'readwrite')
      const store = transaction.objectStore('state')
      const request = store.put(state, 'titan-state')

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async loadState(): Promise<TitanState | null> {
    if (typeof indexedDB === 'undefined') {
      return null
    }

    const db = await this.ensureReady()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['state'], 'readonly')
      const store = transaction.objectStore('state')
      const request = store.get('titan-state')

      request.onsuccess = () => {
        resolve(request.result ?? null)
      }
      request.onerror = () => reject(request.error)
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async clearState(): Promise<void> {
    if (typeof indexedDB === 'undefined') {
      return
    }

    const db = await this.ensureReady()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['state'], 'readwrite')
      const store = transaction.objectStore('state')
      const request = store.delete('titan-state')

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
      transaction.onerror = () => reject(transaction.error)
    })
  }
}

// Singleton instance
export const titanDB = new TitanDB()