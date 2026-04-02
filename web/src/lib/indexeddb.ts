import type { TitanState } from '../types'

// Database configuration
const DB_NAME = 'titan-web-db'
const DB_VERSION = 1
const STORES = ['state'] as const

// Promise wrapper for IndexedDB operations
export class TitanDB {
  private db: IDBDatabase | null = null
  private readyPromise: Promise<void>

  constructor() {
    this.readyPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = () => {
        const db = request.result
        STORES.forEach(storeName => {
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
  }

  private async ensureReady(): Promise<IDBDatabase> {
    await this.readyPromise
    if (!this.db) throw new Error('Database not initialized')
    return this.db
  }

  async saveState(state: TitanState): Promise<void> {
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