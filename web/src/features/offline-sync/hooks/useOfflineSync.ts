import { useEffect, useRef, useState } from 'react'
import { flushOfflineQueue, getOfflineQueue } from '../services/offlineQueue'

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [pendingCount, setPendingCount] = useState(() => getOfflineQueue().length)
  const [isSyncing, setIsSyncing] = useState(false)
  const inFlightSyncRef = useRef<Promise<void> | null>(null)

  function runSync() {
    if (inFlightSyncRef.current) {
      return inFlightSyncRef.current
    }

    const syncPromise = flushOfflineQueue()
      .then((result) => {
        setPendingCount(result.remaining)
      })
      .catch((error) => {
        console.warn('Failed to flush offline queue:', error)
      })
      .finally(() => {
        inFlightSyncRef.current = null
        setIsSyncing(false)
      })

    inFlightSyncRef.current = syncPromise
    return syncPromise
  }

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
      setIsSyncing(true)
      void runSync()
    }

    function handleOffline() {
      setIsOnline(false)
      setPendingCount(getOfflineQueue().length)
    }

    function handleWorkerMessage(event: MessageEvent) {
      if (event.data?.type !== 'SYNC_QUEUE') {
        return
      }

      setIsSyncing(true)
      void runSync()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    navigator.serviceWorker?.addEventListener('message', handleWorkerMessage)

    const monitor = window.setInterval(() => {
      setPendingCount(getOfflineQueue().length)
    }, 4000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      navigator.serviceWorker?.removeEventListener('message', handleWorkerMessage)
      window.clearInterval(monitor)
    }
  }, [])

  async function retrySync() {
    setIsSyncing(true)
    await runSync()
  }

  return {
    isOnline,
    pendingCount,
    isSyncing,
    retrySync,
  }
}
