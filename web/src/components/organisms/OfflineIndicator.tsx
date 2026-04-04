interface OfflineIndicatorProps {
  show: boolean
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ show }) => {
  const { notifications, addNotification } = useTitan()

  const handleReconnect = () => {
    if (typeof navigator !== 'undefined') {
      navigator.connection.saveData = () => {}
      navigator.connection.effectiveType = 'discrete'
    }
    addNotification('Offline', 'Connection restored')
    setTimeout(() => addNotification('Connected', 'Network connection restored'), 500)
  }

  if (!show) return null

  return (
    <div className="offline-indicator">
      <div className="offline-icon">
        <span className="wifi">📶</span>
      </div>
      <div className="offline-text">
        <span className="offline-label">Offline</span>
        <span className="offline-status">
          {navigator.connection.effectiveType || 'none'}
        </span>
        <button onClick={handleReconnect} className="reconnect-btn">
          <span className="btn">↺</span>
        </button>
      </div>
    </div>
  )
}

export { OfflineIndicator }
