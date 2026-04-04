import { createContext, useContext, useState, useEffect } from 'react'

interface TitanContextState {
  isAuthenticated: boolean
  user: User | null
  theme: 'light' | 'dark' | 'system'
  preferences: {
    showNotification: boolean
    language: string
    currency: string
    theme: 'light' | 'dark' | 'system'
  }
  notifications: Notification[]
  isLoading: boolean
  setPreferences: (prefs: Partial<TitanContextState['preferences']>) => void
  addNotification: (title: string, message: string) => void
  dismissNotification: (id: number) => void
  toggleTheme: () => void
  toggleNotification: () => void
  toggleLanguage: (lang: string) => void
  toggleCurrency: (currency: string) => void
}

interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: 'admin' | 'student' | 'recruiter' | 'guest'
}

interface Notification {
  id: number
  title: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
  timestamp: number
}

interface TitanContextType extends TitanContextState {
  setPreferences: (prefs: Partial<TitanContextState['preferences']>) => void
  addNotification: (title: string, message: string) => void
  dismissNotification: (id: number) => void
  toggleTheme: () => void
  toggleNotification: () => void
  toggleLanguage: (lang: string) => void
  toggleCurrency: (currency: string) => void
}

const TitanContext = createContext<TitanContextType | undefined>(undefined)

interface AppShellProps {}

const AppShell: React.FC<AppShellProps> = () => {
  const {
    isAuthenticated,
    user,
    theme,
    preferences,
    notifications,
  } = useContext(TitanContext)

  const handleLogout = () => {
    setIsMobileMenuOpen(false)
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <nav className="app-shell-nav">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-text">Project Titan</span>
          </div>
          <div className="nav-links">
            <a href="/" className="nav-link">Home</a>
            {isAuthenticated && (
              <>
                <a href="/profile" className="nav-link">Profile</a>
                <a href="/settings" className="nav-link">Settings</a>
              </>
            )}
          </div>
          <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(true)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        <div className={`auth-buttons ${!isAuthenticated ? 'unlocked' : ''}`}>
          {!isAuthenticated && (
            <button className="auth-btn">
              <span>Sign In</span>
            </button>
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </nav>

      <main className="app-shell-main">
        <header className="app-shell-header">
          <h1>Welcome to Project Titan</h1>
          <p className="subtitle">Your complete project management platform</p>
        </header>

        <div className="dashboard">
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
