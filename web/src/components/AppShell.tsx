import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTitan } from '../state/titan-context'
import { useDarkMode } from '../lib/utils'

function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useTitan()
  const { isDark, toggle } = useDarkMode()

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobileMenuOpen(false)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => {
    setIsMobileMenuOpen(false)
    navigate('/login')
  }

  return (
    <div className={`app-shell ${isDark ? 'dark' : ''}`}>
      <nav className="app-shell-nav">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-text">Project Titan</span>
          </div>
          <div className="nav-links">
            <a
              href="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Home
            </a>
            <a
              href="/dashboard"
              className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </a>
            {isAuthenticated && (
              <>
                <a
                  href="/profile"
                  className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
                >
                  Profile
                </a>
                <a
                  href="/settings"
                  className={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`}
                >
                  Settings
                </a>
              </>
            )}
          </div>
          <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <div className={`auth-buttons ${isAuthenticated ? 'logged-in' : ''}`}>
          <button className={`auth-btn logout ${isMobileMenuOpen ? 'mobile-hidden' : ''}`}>
            Logout
          </button>
        </div>
      </nav>

      <main className="app-shell-main">
        <header className="app-shell-header">
          <h1>Welcome to Project Titan</h1>
          <p className="subtitle">Your complete project management platform</p>
        </header>

        <div className={`dashboard ${location.pathname === '/dashboard' ? 'active' : ''}`}>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="dashboard-icon">📊</div>
              <h3>Dashboard Overview</h3>
              <p>View your project analytics and insights</p>
            </div>
            {isAuthenticated && (
              <div className="dashboard-card">
                <div className="dashboard-icon">👤</div>
                <h3>My Projects</h3>
                <p>Manage your assigned projects</p>
              </div>
            )}
          </div>

          <div className="quick-actions">
            <button className="quick-btn">
              <span className="btn-icon">📁</span>
              <span>Add New Project</span>
            </button>
            <button className="quick-btn">
              <span className="btn-icon">📝</span>
              <span>View Details</span>
            </button>
          </div>
        </div>
      </main>

      {isMobileMenuOpen && (
        <aside className="mobile-menu">
          <div className="mobile-nav">
            <p className="mobile-logout">Logout</p>
          </div>
        </aside>
      )}
    </div>
  )
}

export { AppShell }
