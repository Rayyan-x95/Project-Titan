import { Outlet } from 'react-router-dom'
import { useTitan } from '../../state/titan-context'

const DashboardLayout = () => {
  const {
    isAuthenticated,
    user,
    theme,
    preferences,
  } = useTitan()

  return (
    <div className="dashboard-layout">
      <Outlet />
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Menu</h2>
        </div>
        <ul className="sidebar-nav">
          <li>
            <a href="/">
              <span className="nav-icon">🏠</span>
              <span>Dashboard</span>
              <span className="badge">{user?.role === 'admin' ? '+5' : '1'}</span>
            </a>
          </li>
          <li>
            <a href="/projects">
              <span className="nav-icon">📁</span>
              <span>My Projects</span>
              <span className="badge">5</span>
            </a>
          </li>
          {isAuthenticated && (
            <>
              <li>
                <a href="/profile">
                  <span className="nav-icon">👤</span>
                  <span>Profile</span>
                </a>
              </li>
              <li>
                <a href="/settings">
                  <span className="nav-icon">⚙️</span>
                  <span>Settings</span>
                </a>
              </li>
            </>
          )}
        </ul>
      </aside>
    </div>
  )
}

export { DashboardLayout }
