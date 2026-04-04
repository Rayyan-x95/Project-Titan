interface NotificationBadgeProps {
  notificationsCount: number
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ notificationsCount }) => {
  const { notifications } = useTitan()

  const unreadCount = notifications.filter(n => n.type === 'info' || n.type === 'error').length

  return (
    <button className="notification-badge">
      {unreadCount > 0 ? (
        <div className="badge-dot">
          <span className="dot"></span>
          {unreadCount}
        </div>
      ) : (
        <span className="badge-count">0</span>
      )}
    </button>
  )
}

export { NotificationBadge }
