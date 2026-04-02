import { titanDB } from '../lib/indexeddb'
import { emptyState } from '../data/emptyState'
import type { TitanState } from '../types'

const STORAGE_KEY = 'titan-web-state-v2'

export interface TitanBackend {
  loadState(): Promise<TitanState | null>
  saveState(state: TitanState): Promise<void>
  clearState(): Promise<void>
}

function getLocalStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function normalizeLocalState(state: unknown) {
  if (!state || typeof state !== 'object') {
    return emptyState
  }

  return state as TitanState
}

export const titanBackend: TitanBackend = {
  async loadState() {
    const storage = getLocalStorage()

    if (storage) {
      const saved = storage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          return normalizeLocalState(JSON.parse(saved))
        } catch {
          return emptyState
        }
      }
    }

    return titanDB.loadState()
  },

  async saveState(state) {
    const storage = getLocalStorage()
    storage?.setItem(STORAGE_KEY, JSON.stringify(state))
    await titanDB.saveState(state)
  },

  async clearState() {
    const storage = getLocalStorage()
    storage?.removeItem(STORAGE_KEY)
    await titanDB.clearState()
  },
}