import './NotificationButton.css'

type NotificationButtonProps = {
  count: number
}

function NotificationButton({ count }: NotificationButtonProps) {
  const label =
    count > 0
      ? `Notifications, ${count} unread`
      : 'Notifications, no unread alerts'

  return (
    <button 
      type="button" 
      className="notification-button" 
      aria-label={label}
      onClick={() => {
        window.dispatchEvent(new CustomEvent('open-notification-drawer'))
      }}
    >
      <span className="material-symbols-rounded notification-button__icon">
        notifications
      </span>
      {count > 0 ? (
        <span className="notification-button__badge" aria-hidden="true">
          {count}
        </span>
      ) : null}
    </button>
  )
}

export default NotificationButton
