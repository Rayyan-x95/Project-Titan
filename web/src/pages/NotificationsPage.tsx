import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { TitanSegmentedControl } from '../components/TitanSegmentedControl'
import { useOfflineSync } from '../features/offline-sync/hooks/useOfflineSync'
import { formatDate } from '../lib/finance'
import { useTitanActions, useTitanState } from '../state/useTitan'

export function NotificationsPage() {
  const state = useTitanState()
  const { isOnline, isSyncing, pendingCount } = useOfflineSync()
  const notifications = state.notifications ?? []
  const {
    clearNotifications,
    dismissNotification,
    markAllNotificationsRead,
    markNotificationRead,
  } = useTitanActions()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const hasLocalPendingChanges = pendingCount > 0 || isSyncing || !isOnline
  const savedLocallyLabel = hasLocalPendingChanges ? 'Yes' : 'No'
  const visibleNotifications =
    filter === 'unread'
      ? notifications.filter((notification) => !notification.read)
      : notifications

  return (
    <div className="page">
      <PageHeader
        eyebrow="Inbox / Activity"
        title="Notification center"
        description="Review local alerts, mark them as read, and clear stale activity when you no longer need it."
        action={
          <div className="button-row">
            <button className="button button-secondary" onClick={markAllNotificationsRead} type="button">
              Mark all read
            </button>
            <button className="button button-ghost" onClick={() => clearNotifications(true)} type="button">
              Clear read
            </button>
          </div>
        }
      />

      <section className="glass-panel form-panel">
        <div className="metric-grid">
          <div>
            <span>Total</span>
            <strong>{notifications.length}</strong>
          </div>
          <div>
            <span>Unread</span>
            <strong>{notifications.filter((notification) => !notification.read).length}</strong>
          </div>
          <div>
            <span>Warnings</span>
            <strong>{notifications.filter((notification) => notification.kind === 'warning').length}</strong>
          </div>
          <div>
            <span>Saved locally</span>
            <strong>{savedLocallyLabel}</strong>
          </div>
        </div>

        <TitanSegmentedControl
          label="Filter"
          onChange={(value) => setFilter(value as 'all' | 'unread')}
          options={[
            { value: 'all', label: 'All' },
            { value: 'unread', label: 'Unread' },
          ]}
          value={filter}
        />
      </section>

      <section className="glass-panel">
        <div className="list-block">
          {visibleNotifications.length === 0 ? (
            <p className="muted-copy">No notifications match the current filter.</p>
          ) : (
            visibleNotifications.map((notification) => (
              <article
                key={notification.id}
                className={`list-row list-row-static note-${notification.kind} ${notification.read ? 'is-read' : 'is-unread'}`}
              >
                <div>
                  <strong>{notification.title}</strong>
                  <span>
                    {notification.message} · {formatDate(notification.createdAt)}
                  </span>
                </div>
                <div className="row-actions">
                  {notification.href ? (
                    <Link
                      className="inline-link"
                      onClick={() => markNotificationRead(notification.id)}
                      to={notification.href}
                    >
                      Open
                    </Link>
                  ) : null}
                  {!notification.read ? (
                    <button
                      className="button button-secondary button-small"
                      onClick={() => markNotificationRead(notification.id)}
                      type="button"
                    >
                      Mark read
                    </button>
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
            ))
          )}
        </div>
      </section>
    </div>
  )
}
