import { renderHook, act, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useOfflineSync } from './useOfflineSync'

const flushOfflineQueue = vi.fn()
const getOfflineQueue = vi.fn()

vi.mock('../services/offlineQueue', () => ({
  flushOfflineQueue,
  getOfflineQueue,
}))

describe('useOfflineSync', () => {
  let workerListeners: Set<(event: MessageEvent) => void>

  beforeEach(() => {
    workerListeners = new Set()
    flushOfflineQueue.mockReset()
    getOfflineQueue.mockReset()
    getOfflineQueue.mockReturnValue([{ id: '1' }])

    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    })

    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        addEventListener: (_type: string, listener: EventListener) => {
          workerListeners.add(listener as (event: MessageEvent) => void)
        },
        removeEventListener: (_type: string, listener: EventListener) => {
          workerListeners.delete(listener as (event: MessageEvent) => void)
        },
      },
    })
  })

  it('deduplicates sync requests while a flush is in flight', async () => {
    let resolveFlush!: (value: { synced: number; remaining: number }) => void
    flushOfflineQueue.mockReturnValue(
      new Promise((resolve) => {
        resolveFlush = resolve
      }),
    )

    const { result } = renderHook(() => useOfflineSync())

    expect(result.current.pendingCount).toBe(1)

    act(() => {
      window.dispatchEvent(new Event('online'))
      window.dispatchEvent(new Event('online'))
      workerListeners.forEach((listener) => listener(new MessageEvent('message', { data: { type: 'SYNC_QUEUE' } })))
    })

    expect(flushOfflineQueue).toHaveBeenCalledTimes(1)
    expect(result.current.isSyncing).toBe(true)

    act(() => {
      resolveFlush({ synced: 1, remaining: 0 })
    })

    await waitFor(() => {
      expect(result.current.isSyncing).toBe(false)
      expect(result.current.pendingCount).toBe(0)
    })
  })
})