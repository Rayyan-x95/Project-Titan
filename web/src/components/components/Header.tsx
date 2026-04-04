import { Link, useLocation } from 'react-router-dom'
import { useDarkMode } from '../../lib/utils'
import { useTitan } from '../../state/titan-context'

function Header() {
  const { isAuthenticated } = useTitan()
  const { isDark } = useDarkMode()
  const location = useLocation()

  return (
    <header
      className={`header ${isDark ? 'dark' : ''}`}
      style={{
        background: isDark ? '#1a1a2e' : '#f5f5f5',
        borderBottom: '1px solid',
        borderColor: isDark ? '#2a2a3e' : '#e0e0e0'
      }}
    >
      <div className="header-content">
        <Link
          to="/"
          className={`header-logo ${location.pathname === '/' ? 'active' : ''}`}
        >
          <span className="logo-text">Project Titan</span>
        </Link>
      </div>
    </header>
  )
}

export { Header }
