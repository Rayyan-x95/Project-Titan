import { useNavigate } from 'react-router-dom'
import { useTitanState } from '../../state/useTitan'

export function NotificationBadge() {
  const navigate = useNavigate()
  const state = useTitanState()
  const notifications = state.notifications ?? []
  const unreadCount = notifications.filter((notification) => !notification.read).length

  return (
    <button
      aria-label="Open notifications"
      className="notification-badge"
      onClick={() => navigate('/notifications')}
      type="button"
    >
      {unreadCount > 0 ? (
        <div className="badge-dot">
          <span className="dot" />
          {unreadCount}
        </div>
      ) : (
        <span className="badge-count">0</span>
      )}
    </button>
  )
}
