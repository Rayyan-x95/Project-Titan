import { titanDB } from '../lib/indexeddb'
import { emptyState } from '../data/emptyState'
import type { TitanState } from '../types'

const STORAGE_KEY = 'titan-web-state-v2'
const SAVE_DEBOUNCE_MS = 250

let cachedState: TitanState | null = null
let cachedLoadPromise: Promise<TitanState | null> | null = null
let latestPendingState: TitanState | null = null
let saveTimer: ReturnType<typeof window.setTimeout> | null = null
let saveInFlight = Promise.resolve()

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

async function readStoredState() {
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
}

async function flushLatestState() {
  if (!latestPendingState) {
    return
  }

  const stateToPersist = latestPendingState
  latestPendingState = null

  const storage = getLocalStorage()

  if (storage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(stateToPersist))
  }

  await titanDB.saveState(stateToPersist)
}

export const titanBackend: TitanBackend = {
  async loadState() {
    if (cachedState) {
      return cachedState
    }

    if (!cachedLoadPromise) {
      cachedLoadPromise = readStoredState()
        .then((state) => {
          cachedState = state ?? emptyState
          return cachedState
        })
        .catch(() => emptyState)
    }

    return cachedLoadPromise
  },

  async saveState(state) {
    cachedState = state
    latestPendingState = state

    if (saveTimer) {
      window.clearTimeout(saveTimer)
    }

    saveTimer = window.setTimeout(() => {
      saveTimer = null
      saveInFlight = saveInFlight
        .then(() => flushLatestState())
        .catch((error) => {
          console.warn('Failed to save Titan state:', error)
        })
    }, SAVE_DEBOUNCE_MS)

    return Promise.resolve()
  },

  async clearState() {
    cachedState = emptyState
    latestPendingState = null

    if (saveTimer) {
      window.clearTimeout(saveTimer)
      saveTimer = null
    }

    const storage = getLocalStorage()
    storage?.removeItem(STORAGE_KEY)
    await titanDB.clearState()
  },
}