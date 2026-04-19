import { useOfflineSync } from '../hooks/useOfflineSync'

export function OfflineStatusBar() {
  const { isOnline, pendingCount, isSyncing, retrySync, syncMode } = useOfflineSync()

  if (isOnline && pendingCount === 0 && !isSyncing && syncMode === 'cloud') {
    return null
  }

  const statusCopy = isOnline
    ? syncMode === 'local-only'
      ? `${pendingCount} queued change(s). Cloud sync is not configured in this deployment.`
      : `${pendingCount} change(s) pending sync`
    : 'You are offline. Changes are queued locally.'

  return (
    <section className="offline-status-bar" aria-live="polite">
      <span>{statusCopy}</span>
      <button className="button button-small button-secondary" onClick={() => void retrySync()} type="button">
        {isSyncing ? 'Syncing...' : syncMode === 'local-only' ? 'Check sync config' : 'Retry sync'}
      </button>
    </section>
  )
}
