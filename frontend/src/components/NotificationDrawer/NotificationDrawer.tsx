import { useDormShare } from '../../data/DormShareContext'
import type { DormShareNotification } from '../../data/types'
import './NotificationDrawer.css'

type NotificationDrawerProps = {
  onClose: () => void
  onOpenListing: (listingId: string) => void
  onOpenChat: (chatId: string) => void
}

function NotificationDrawer({
  onClose,
  onOpenListing,
  onOpenChat,
}: NotificationDrawerProps) {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
  } = useDormShare()

  function handleNotifClick(notif: DormShareNotification) {
    markNotificationAsRead(notif.id)
    onClose()

    if (notif.targetId) {
      if (notif.type === 'message') {
        onOpenChat(notif.targetId)
      } else if (notif.type === 'like' || notif.type === 'system') {
        // Deep-link routing to the specific listing
        onOpenListing(notif.targetId)
      }
    }
  }

  function getNotifIcon(type: string) {
    switch (type) {
      case 'like':
        return 'favorite'
      case 'message':
        return 'chat'
      case 'offer':
        return 'attach_money'
      default:
        return 'notifications'
    }
  }

  return (
    <div className="notif-backdrop" onClick={onClose}>
      <div className="notif-drawer" onClick={(e) => e.stopPropagation()}>
        <header className="notif-drawer__header">
          <div className="notif-drawer__title-group">
            <h2>Notifications</h2>
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <span className="notif-drawer__count-badge">
                {notifications.filter((n) => !n.isRead).length} new
              </span>
            )}
          </div>
          <button
            type="button"
            className="notif-drawer__close-btn"
            onClick={onClose}
            aria-label="Close notifications"
          >
            <span className="material-symbols-rounded">close</span>
          </button>
        </header>

        <div className="notif-drawer__actions">
          <button
            type="button"
            className="notif-drawer__text-action"
            onClick={markAllNotificationsAsRead}
            disabled={notifications.every((n) => n.isRead)}
          >
            Mark all as read
          </button>
          <button
            type="button"
            className="notif-drawer__text-action notif-drawer__text-action--danger"
            onClick={clearAllNotifications}
            disabled={notifications.length === 0}
          >
            Clear all
          </button>
        </div>

        <section className="notif-drawer__list" aria-label="Notifications list">
          {notifications.length > 0 ? (
            notifications.map((notif) => {
              const showAvatar = notif.type === 'like' || notif.type === 'message'

              return (
                <div
                  key={notif.id}
                  className={`notif-row ${!notif.isRead ? 'notif-row--unread' : ''}`}
                  onClick={() => handleNotifClick(notif)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${notif.title}: ${notif.body}`}
                >
                  {/* Left avatar/icon column */}
                  <div className="notif-row__media" aria-hidden="true">
                    {showAvatar && notif.senderInitials ? (
                      <span className="notif-row__avatar">
                        {notif.senderInitials}
                      </span>
                    ) : (
                      <span className={`notif-row__icon-well notif-row__icon-well--${notif.type}`}>
                        <span className="material-symbols-rounded">
                          {getNotifIcon(notif.type)}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Body Copy Column */}
                  <div className="notif-row__body">
                    <div className="notif-row__header">
                      <strong>{notif.title}</strong>
                      <time>{notif.timestamp}</time>
                    </div>
                    <p>{notif.body}</p>
                  </div>

                  {/* Unread marker dot */}
                  {!notif.isRead && (
                    <span className="notif-row__dot" aria-hidden="true" />
                  )}
                </div>
              )
            })
          ) : (
            <div className="notif-drawer__empty">
              <span className="notif-drawer__empty-icon">
                <span className="material-symbols-rounded">notifications_off</span>
              </span>
              <h3>All caught up!</h3>
              <p>You have no notifications at the moment. We'll alert you here when new actions arrive.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default NotificationDrawer
