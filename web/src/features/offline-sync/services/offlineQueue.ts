import type { OfflineOperation } from '../utils/offlineTypes'

const QUEUE_KEY = 'titan-offline-queue'
const REMOTE_SYNC_ENDPOINT = import.meta.env.VITE_SYNC_API_URL?.trim()

export type OfflineSyncMode = 'cloud' | 'local-only'

export type OfflineSyncResult = {
  synced: number
  remaining: number
  mode: OfflineSyncMode
}

export function isRemoteSyncConfigured() {
  return Boolean(REMOTE_SYNC_ENDPOINT)
}

function readQueue() {
  try {
    return (JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') as OfflineOperation[])
  } catch {
    return []
  }
}

function writeQueue(queue: OfflineOperation[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

function createId() {
  return `op-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function getOfflineQueue() {
  return readQueue()
}

export function enqueueOfflineOperation(operation: Omit<OfflineOperation, 'id' | 'createdAt'>) {
  const queue = readQueue()
  const nextOperation: OfflineOperation = {
    ...operation,
    id: createId(),
    createdAt: Date.now(),
  }

  // Last-write-wins conflict strategy by entity key + type.
  const dedupedQueue = queue.filter((item) => !(item.entityKey === operation.entityKey && item.type === operation.type))
  dedupedQueue.push(nextOperation)
  writeQueue(dedupedQueue)

  return dedupedQueue.length
}

export async function flushOfflineQueue(): Promise<OfflineSyncResult> {
  const queue = readQueue()
  if (queue.length === 0) {
    return { synced: 0, remaining: 0, mode: isRemoteSyncConfigured() ? 'cloud' : 'local-only' }
  }

  try {
    if (!REMOTE_SYNC_ENDPOINT) {
      return { synced: 0, remaining: queue.length, mode: 'local-only' }
    }

    const response = await fetch(REMOTE_SYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ operations: queue }),
    })

    if (!response.ok) {
      throw new Error(`Remote sync failed with status ${response.status}`)
    }

    writeQueue([])
    return { synced: queue.length, remaining: 0, mode: 'cloud' }
  } catch {
    return { synced: 0, remaining: queue.length, mode: isRemoteSyncConfigured() ? 'cloud' : 'local-only' }
  }
}
