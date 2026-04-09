import { NavLink } from 'react-router-dom'
import { NotificationBadge } from '../organisms/NotificationBadge'
import { useTitanState } from '../../state/useTitan'

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'History', to: '/history' },
  { label: 'Groups', to: '/groups' },
  { label: 'Budget', to: '/budget' },
  { label: 'Insights', to: '/insights' },
]

export function Navbar() {
  const state = useTitanState()

  return (
    <nav className="navbar" aria-label="Primary">
      <div className="navbar-left">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="navbar-right">
        <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/sms">
          SMS
        </NavLink>
        <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/profile">
          {state.currentUser ? state.currentUser : 'Profile'}
        </NavLink>
        <NotificationBadge />
      </div>
    </nav>
  )
}
