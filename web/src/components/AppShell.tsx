import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { NavLink, useLocation, useOutlet } from 'react-router-dom'
import { CurrencyToolbar } from '../features/currency/components/CurrencyToolbar'
import { OfflineStatusBar } from '../features/offline-sync/components/OfflineStatusBar'
import { PwaCard } from './PwaCard'
import { useTitanActions, useTitanState } from '../state/useTitan'

const navItems = [
  { path: '/', label: 'HOME' },
  { path: '/cash', label: 'ARSENAL' },
  { path: '/history', label: 'LEDGER' },
  { path: '/insights', label: 'PULSE' },
]

export default function AppShell() {
  const location = useLocation()
  const outlet = useOutlet()
  const shouldReduceMotion = useReducedMotion()
  const state = useTitanState()
  const { setCurrentUser } = useTitanActions()

  return (
    <div className="app-container">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="ambient-light-1" />
      <div className="ambient-light-2" />
      <header className="shell-brand" aria-label="Titan app">
        <img className="shell-brand-wordmark" src="/titan_logo_full_transparent.png" alt="Titan logo" />
      </header>
      <section className="profile-setup glass-panel" aria-label="Profile setup">
        <label className="field profile-setup-field">
          <span>Profile name</span>
          <input
            aria-label="Your profile name"
            maxLength={28}
            onChange={(event) => setCurrentUser(event.target.value)}
            placeholder="Set your name to unlock splits"
            value={state.currentUser}
          />
        </label>
      </section>
      <OfflineStatusBar />
      <CurrencyToolbar />
      <main id="main" className="screen-content">
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={location.pathname}
            className="route-motion-wrap"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {outlet}
          </m.div>
        </AnimatePresence>
        <PwaCard />
      </main>
      <nav className="floating-nav glass-surface-3" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            end={item.path === '/'}
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


