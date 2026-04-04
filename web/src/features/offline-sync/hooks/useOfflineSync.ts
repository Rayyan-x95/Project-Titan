import { useEffect, useMemo, useState } from 'react'
import { flushOfflineQueue, getOfflineQueue } from '../services/offlineQueue'

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [pendingCount, setPendingCount] = useState(() => getOfflineQueue().length)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
      setIsSyncing(true)
      void flushOfflineQueue().then((result) => {
        setPendingCount(result.remaining)
      }).finally(() => {
        setIsSyncing(false)
      })
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
      void flushOfflineQueue().then((result) => {
        setPendingCount(result.remaining)
      }).finally(() => {
        setIsSyncing(false)
      })
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
    const result = await flushOfflineQueue()
    setPendingCount(result.remaining)
    setIsSyncing(false)
  }

  return useMemo(() => ({
    isOnline,
    pendingCount,
    isSyncing,
    retrySync,
  }), [isOnline, pendingCount, isSyncing])
}
