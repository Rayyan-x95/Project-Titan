import { useOfflineSync } from '../hooks/useOfflineSync'

export function OfflineStatusBar() {
  const { isOnline, pendingCount, isSyncing, retrySync } = useOfflineSync()

  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null
  }

  return (
    <section className="offline-status-bar" aria-live="polite">
      <span>
        {isOnline ? `${pendingCount} change(s) pending sync` : 'You are offline. Changes are queued locally.'}
      </span>
      <button className="button button-small button-secondary" onClick={() => void retrySync()} type="button">
        {isSyncing ? 'Syncing...' : 'Retry sync'}
      </button>
    </section>
  )
}
