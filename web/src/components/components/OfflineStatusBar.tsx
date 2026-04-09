type OfflineStatusBarProps = {
  show: boolean
  isConnected: boolean
}

export function OfflineStatusBar({ show, isConnected }: OfflineStatusBarProps) {
  if (!show) {
    return null
  }

  return (
    <div className="offline-status-bar">
      <div className="status-icon">
        <span className="icon" aria-hidden="true">
          {isConnected ? 'OK' : 'OFF'}
        </span>
      </div>
      <div className="status-text">
        <span className="label">{isConnected ? 'Connected' : 'Disconnected'}</span>
        <span className="indicator">{isConnected ? 'Live sync available' : 'Queued locally'}</span>
      </div>
    </div>
  )
}
