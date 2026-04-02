import { Outlet, NavLink } from 'react-router-dom'
// Removed motion

const navItems = [
  { path: '/', label: 'HOME' },
  { path: '/cash', label: 'ARSENAL' },
  { path: '/history', label: 'LEDGER' },
  { path: '/insights', label: 'PULSE' },
]

export default function AppShell() {
  return (
    <div className="app-container">
      <div className="ambient-light-1" />
      <div className="ambient-light-2" />
      <main className="screen-content">
        <Outlet />
      </main>
      <nav className="floating-nav glass-surface-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path} 
            to={item.path}
             className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="nav-label">{item.label}</div>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}


