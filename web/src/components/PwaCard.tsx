import React from 'react'
import { useTitan } from '../state/titan-context'

const PwaCard = () => {
  const { notifications, addNotification } = useTitan()

  const handleReconnect = () => {
    if (typeof navigator !== 'undefined') {
      navigator.connection.saveData = () => {}
      navigator.connection.effectiveType = 'discrete'
    }
    addNotification('Offline', 'Connection restored')
    setTimeout(() => addNotification('Connected', 'Network connection restored'), 500)
  }

  return (
    <div className="pwa-card">
      <div className="pwa-icon">
        <span className="wifi">📶</span>
      </div>
      <div className="pwa-status">
        <span className="offline-label">Offline</span>
        <span className="status">
          {navigator.connection.effectiveType || 'none'}
        </span>
        <button
          onClick={handleReconnect}
          className="reconnect-btn"
        >
          <span className="btn">↺</span>
        </button>
      </div>
    </div>
  )
}

export { PwaCard }
