import { Link } from 'react-router-dom'
import { useTitanActions, useTitanState } from '../state/useTitan'

export function Notifications() {
  const state = useTitanState()
  const { dismissNotification } = useTitanActions()
  const notifications = state.notifications.slice(0, 3)
  const totalCount = state.notifications.length

  if (notifications.length === 0) {
    return null
  }

  return (
    <section className="notifications-bar" aria-live="polite">
      <div className="notifications-content">
        <span className="notification-count">{totalCount}</span>
        <div className="notifications-list">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`notification-item notification-${notification.kind}`}
            >
              <div>
                <strong>{notification.title}</strong>
                <span>{notification.message}</span>
              </div>
              <div className="row-actions">
                {notification.href ? (
                  <Link className="inline-link" to={notification.href}>
                    Open
                  </Link>
                ) : null}
                <button
                  className="button button-ghost button-small"
                  onClick={() => dismissNotification(notification.id)}
                  type="button"
                >
                  Dismiss
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
