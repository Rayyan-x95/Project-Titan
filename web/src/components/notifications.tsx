import React from 'react'
import { useTitan } from '../state/titan-context'

const Notifications = () => {
  const { notifications, close, dismiss } = useTitan()

  return (
    <div className="notifications-bar">
      <div className="notifications-icon">
        <span className="icon">🔔</span>
      </div>
      <div className="notifications-content">
        <span className="notification-count">
          {notifications.filter(n => n.type === 'info').length}
        </span>
        <div className="notifications-list">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`notification-item ${n.type}`}
              onClick={close}
            >
              <span className="notification-title">{n.title}</span>
              <span className="notification-message">{n.message}</span>
            </div>
          ))}
        </div>
        <div className="notification-close-btn" onClick={dismiss}>
          <span className="btn">✕</span>
        </div>
      </div>
    </div>
  )
}

export { Notifications }
