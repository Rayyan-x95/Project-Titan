import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTitan } from '../../state/titan-context'

function Navbar() {
  const location = useLocation()
  const { isAuthenticated } = useTitan()
  const { preferences: prefs } = useTitan()

  const [selectedCurrency, setSelectedCurrency] = useState(prefs.currency)

  const handleCurrencyChange = (code: string) => {
    setSelectedCurrency(code)
  }

  const currentCurrency = prefs.currency || 'USD'

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: '📊' },
    { label: 'Projects', to: '/projects', icon: '📁' },
    { label: 'My Projects', to: '/projects/my', icon: '📂' },
    { label: 'My Documents', to: '/documents', icon: '📄' },
  ]

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo">
          <span className="logo-text">Project Titan</span>
        </Link>
      </div>

      <div className="navbar-right">
        <div className="auth-buttons">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
              <Link to="/settings" className="nav-link">
                Settings
              </Link>
            </>
          ) : (
            <div className="nav-items">
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link">
                Register
              </Link>
            </div>
          )}
        </div>

        <div className="right-actions">
          <select
            value={selectedCurrency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="currency-select"
          >
            {prefs.currency && (
              <option value={prefs.currency}>{prefs.currency}</option>
            )}
            {prefs.currency && (
              <option value="USD">USD</option>
            )}
            {prefs.currency && (
              <option value="EUR">EUR</option>
            )}
            {prefs.currency && (
              <option value="GBP">GBP</option>
            )}
            {prefs.currency && (
              <option value="JPY">JPY</option>
            )}
            {prefs.currency && (
              <option value="CAD">CAD</option>
            )}
            {prefs.currency && (
              <option value="AUD">AUD</option>
            )}
            {prefs.currency && (
              <option value="INR">INR</option>
            )}
          </select>

          <button
            className={`currency-btn ${currentCurrency}`}
            onClick={() => handleCurrencyChange(currentCurrency)}
          >
            {currentCurrency.toUpperCase()}
          </button>

          {prefs.theme === 'system' ? (
            <button
              onClick={e => {
                e.stopPropagation()
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
                const theme = prefersDark ? 'dark' : 'light'
                document.documentElement.setAttribute('data-theme', theme)
              }}
              className="theme-btn"
            >
              <span>{preferences.theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>
          ) : (
            <span className="user-profile">
              👤
            </span>
          )}
        </div>
      </div>
    </nav>
  )
}

export { Navbar }
