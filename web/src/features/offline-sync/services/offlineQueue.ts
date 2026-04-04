import type { OfflineOperation } from '../utils/offlineTypes'

const QUEUE_KEY = 'titan-offline-queue'

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

export async function flushOfflineQueue() {
  const queue = readQueue()
  if (queue.length === 0) {
    return { synced: 0, remaining: 0 }
  }

  try {
    // Placeholder for remote sync integration (Supabase/API).
    // Local-first behavior keeps user state already applied.
    await Promise.resolve()
    writeQueue([])
    return { synced: queue.length, remaining: 0 }
  } catch {
    return { synced: 0, remaining: queue.length }
  }
}
