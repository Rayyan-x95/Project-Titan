interface OfflineStatusBarProps {
  show: boolean
  isConnected: boolean
}

const OfflineStatusBar: React.FC<OfflineStatusBarProps> = ({ show, isConnected }) => {
  if (!show) return null

  const status = isConnected
    ? 'Connected'
    : 'Disconnected'

  const icon = isConnected
    ? '✓'
    : '✗'

  return (
    <div className="offline-status-bar">
      <div className="status-icon">
        <span className="icon">{icon}</span>
      </div>
      <div className="status-text">
        <span className="label">{status}</span>
        <span className="indicator">{isConnected ? '●' : '○'}</span>
      </div>
    </div>
  )
}

export { OfflineStatusBar }
