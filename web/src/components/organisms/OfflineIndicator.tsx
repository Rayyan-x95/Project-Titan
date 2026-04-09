import { useEffect, useState } from 'react'

type OfflineIndicatorProps = {
  show: boolean
}

type NetworkNavigator = Navigator & {
  connection?: {
    effectiveType?: string
  }
}

export function OfflineIndicator({ show }: OfflineIndicatorProps) {
  const [networkType, setNetworkType] = useState(
    () => (navigator as NetworkNavigator).connection?.effectiveType ?? 'unknown',
  )

  useEffect(() => {
    function handleChange() {
      setNetworkType((navigator as NetworkNavigator).connection?.effectiveType ?? 'unknown')
    }

    window.addEventListener('online', handleChange)
    window.addEventListener('offline', handleChange)

    return () => {
      window.removeEventListener('online', handleChange)
      window.removeEventListener('offline', handleChange)
    }
  }, [])

  if (!show) {
    return null
  }

  return (
    <div className="offline-indicator">
      <div className="offline-icon">
        <span className="wifi" aria-hidden="true">
          Offline
        </span>
      </div>
      <div className="offline-text">
        <span className="offline-label">Offline mode enabled</span>
        <span className="offline-status">{networkType}</span>
      </div>
    </div>
  )
}
