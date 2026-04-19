import { titanDB } from '../lib/indexeddb'
import { emptyState } from '../data/emptyState'
import type { TitanState } from '../types'

const SAVE_DEBOUNCE_MS = 250

let cachedState: TitanState | null = null
let cachedLoadPromise: Promise<TitanState | null> | null = null
let latestPendingState: TitanState | null = null
let saveTimer: number | null = null
let saveInFlight = Promise.resolve()

export interface TitanBackend {
  loadState(): Promise<TitanState | null>
  saveState(state: TitanState): Promise<void>
  clearState(): Promise<void>
}

async function readStoredState() {
  return titanDB.loadState()
}

async function flushLatestState() {
  if (!latestPendingState) {
    return
  }

  const stateToPersist = latestPendingState
  latestPendingState = null

  await titanDB.saveState(stateToPersist)
}

function flushNow() {
  if (saveTimer) {
    window.clearTimeout(saveTimer)
    saveTimer = null
  }
  if (latestPendingState) {
    const stateToPersist = latestPendingState
    latestPendingState = null
    saveInFlight = saveInFlight
      .then(() => titanDB.saveState(stateToPersist))
      .catch((error) => {
        console.warn('Failed to save Titan state:', error)
      })
  }
}

window.addEventListener('pagehide', () => {
  flushNow()
})

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

    await titanDB.clearState()
  },
}
