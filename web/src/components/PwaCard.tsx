import { useEffect, useState } from 'react'

type NetworkNavigator = Navigator & {
  connection?: {
    effectiveType?: string
  }
}

function getNetworkType() {
  if (typeof navigator === 'undefined') {
    return 'unknown'
  }

  return (navigator as NetworkNavigator).connection?.effectiveType ?? 'unknown'
}

export function PwaCard() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  )
  const [networkType, setNetworkType] = useState(getNetworkType)

  useEffect(() => {
    function handleStatusChange() {
      setIsOnline(navigator.onLine)
      setNetworkType(getNetworkType())
    }

    window.addEventListener('online', handleStatusChange)
    window.addEventListener('offline', handleStatusChange)

    return () => {
      window.removeEventListener('online', handleStatusChange)
      window.removeEventListener('offline', handleStatusChange)
    }
  }, [])

  return (
    <div className="pwa-card">
      <div className="pwa-icon">
        <span className="wifi" aria-hidden="true">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
      <div className="pwa-status">
        <span className="offline-label">{isOnline ? 'Connection active' : 'Offline mode'}</span>
        <span className="status">{networkType}</span>
      </div>
    </div>
  )
}
