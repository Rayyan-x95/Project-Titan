import { memo, useState } from 'react'
import { motion } from 'framer-motion'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  formatPaise,
  getHealthScore,
  getPersonBalances,
  getSummaryInsights,
  getTotalOwePaise,
  getTotalOwedPaise,
} from '../lib/finance'
import { useTitan } from '../state/useTitan'
import { PwaCard } from './PwaCard'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/expense/new', label: 'Add split' },
  { to: '/history', label: 'History' },
  { to: '/groups', label: 'Groups' },
  { to: '/sms', label: 'SMS' },
  { to: '/cash', label: 'Cash' },
  { to: '/emis', label: 'EMI' },
  { to: '/rent', label: 'Rent' },
  { to: '/insights', label: 'Insights' },
]

export default memo(function AppShell() {
  const { pathname } = useLocation()
  const { state, setCurrentUser } = useTitan()
  const [nameDraft, setNameDraft] = useState(state.currentUser)
  const [showMobileProfileEditor, setShowMobileProfileEditor] = useState(false)
  const hasCurrentUser = Boolean(state.currentUser)
  const balances = getPersonBalances(state.splits, state.currentUser)
  const totalOwedPaise = getTotalOwedPaise(balances)
  const totalOwePaise = getTotalOwePaise(balances)
  const summary = getSummaryInsights(state.splits, state.currentUser)
  const health = getHealthScore(state.emis, state.splits)

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Main sidebar navigation">
        <div className="sidebar-top" tabIndex={-1} aria-label="Sidebar top section">
          <div className="brand-block">
            <span className="brand-kicker">Titan / Vault</span>
            <h2 className="brand-name">Finance, edited for the web.</h2>
            <p className="brand-copy">
              Split debts, cash flow, rent cycles, and EMI pressure in one dark
              editorial workspace.
            </p>
          </div>

          {hasCurrentUser ? (
            <div className="mobile-summary" aria-live="polite">
              <div>
                <span className="eyebrow">Current user</span>
                <strong>{state.currentUser}</strong>
              </div>
              <div>
                <span className="eyebrow">Net</span>
                <strong>{formatPaise(totalOwedPaise - totalOwePaise)}</strong>
              </div>
              <button
                className="button button-ghost button-small mobile-summary-action"
                aria-label={showMobileProfileEditor ? 'Close profile editor' : 'Edit profile'}
                onClick={() => setShowMobileProfileEditor((current) => !current)}
                type="button"
              >
                {showMobileProfileEditor ? 'Close' : 'Edit'}
              </button>
            </div>
          ) : null}
        </div>

        <PwaCard />

        <div
          className={`sidebar-panel profile-panel ${
            hasCurrentUser && !showMobileProfileEditor ? 'profile-panel-collapsed' : ''
          }`}
          aria-label="Profile editor panel"
        >
          <p className="eyebrow">Current user</p>
          <form
            className="profile-form"
            aria-label="Profile form"
            onSubmit={(event) => {
              event.preventDefault()
              setCurrentUser(nameDraft)
              setShowMobileProfileEditor(!nameDraft.trim())
            }}
          >
            <label className="field">
              <span id="profile-name-label">Your name</span>
              <input
                aria-labelledby="profile-name-label"
                onChange={(event) => setNameDraft(event.target.value)}
                placeholder="Enter your name"
                value={nameDraft}
                required
              />
            </label>
            <button className="button button-primary button-full" type="submit" aria-label={state.currentUser ? 'Update profile' : 'Save profile'}>
              {state.currentUser ? 'Update profile' : 'Save profile'}
            </button>
          </form>
          <p className="brand-copy">
            This name is used as the payer and owner for new web entries.
          </p>
        </div>

        <nav className="sidebar-nav" aria-label="Primary navigation" role="navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link-active' : 'nav-link'
              }
              end={item.end}
              to={item.to}
              aria-label={item.label}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-panel live-panel">
          <p className="eyebrow">Live net</p>
          {state.currentUser ? (
            <>
              <h3>{formatPaise(totalOwedPaise - totalOwePaise)}</h3>
              <div className="mini-metrics">
                <div>
                  <span>Owed to you</span>
                  <strong>{formatPaise(totalOwedPaise)}</strong>
                </div>
                <div>
                  <span>You owe</span>
                  <strong>{formatPaise(totalOwePaise)}</strong>
                </div>
                <div>
                  <span>Pending</span>
                  <strong>{formatPaise(summary.totalPendingAmountPaise)}</strong>
                </div>
                <div>
                  <span>Health</span>
                  <strong>{health.score}%</strong>
                </div>
              </div>
            </>
          ) : (
            <p className="brand-copy">
              Save your name first, then Titan will calculate balances from the
              entries you add.
            </p>
          )}
        </div>
      </aside>

      <motion.main
        key={pathname}
        className="workspace"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <Outlet />
      </motion.main>
    </div>
  )
})
