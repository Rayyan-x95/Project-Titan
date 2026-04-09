import { Link } from 'react-router-dom'
import { useDarkMode } from '../../lib/utils'

export function Header() {
  const { isDark } = useDarkMode()

  return (
    <header
      className={`header ${isDark ? 'dark' : ''}`}
      style={{
        background: isDark ? '#1a1a2e' : '#f5f5f5',
        borderBottom: '1px solid',
        borderColor: isDark ? '#2a2a3e' : '#e0e0e0',
      }}
    >
      <div className="header-content">
        <Link className="header-logo" to="/">
          <span className="logo-text">Titan</span>
        </Link>
        <p className="header-copy">Offline-first expense coordination for shared money flows.</p>
      </div>
    </header>
  )
}
