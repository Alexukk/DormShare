import './BottomNav.css'

export type BottomNavItem = 'feed' | 'sell' | 'chats' | 'profile'

type NavItem = {
  id: BottomNavItem
  label: string
  icon: string
  badge?: number
}

const navItems: NavItem[] = [
  { id: 'feed', label: 'Feed', icon: 'home' },
  { id: 'sell', label: 'Sell', icon: 'add_circle' },
  { id: 'chats', label: 'Chats', icon: 'chat_bubble', badge: 2 },
  { id: 'profile', label: 'Profile', icon: 'person' },
]

type BottomNavProps = {
  activeItem?: BottomNavItem
  onSelect?: (item: BottomNavItem) => void
}

function BottomNav({ activeItem = 'feed', onSelect }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      <ul className="bottom-nav__list">
        {navItems.map((item) => (
          <li key={item.id} className="bottom-nav__item">
            <button
              type="button"
              className="bottom-nav__button"
              aria-current={activeItem === item.id ? 'page' : undefined}
              onClick={() => onSelect?.(item.id)}
            >
              <span className="bottom-nav__icon-wrap" aria-hidden="true">
                <span className="material-symbols-rounded bottom-nav__icon">
                  {item.icon}
                </span>
                {item.badge ? (
                  <span className="bottom-nav__badge">{item.badge}</span>
                ) : null}
              </span>
              <span className="bottom-nav__label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default BottomNav
