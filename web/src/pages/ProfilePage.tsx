import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { formatRupees, getCashBalance, getCurrentMonthTrackedSpendRupees } from '../lib/finance'
import { useTitanActions, useTitanState } from '../state/useTitan'

export function ProfilePage() {
  const state = useTitanState()
  const { setCurrentUser, updateProfile } = useTitanActions()
  const [displayName, setDisplayName] = useState(state.currentUser)
  const [savingsGoal, setSavingsGoal] = useState(
    state.profile.savingsGoalRupees > 0 ? String(state.profile.savingsGoalRupees) : '',
  )
  const [showSaved, setShowSaved] = useState(false)
  const monthlySpend = getCurrentMonthTrackedSpendRupees(state)
  const cashBalance = getCashBalance(state.cashEntries)

  return (
    <div className="page">
      <PageHeader
        eyebrow="Profile / Settings"
        title="Personal defaults"
        description="Save the name Titan should use for payer logic and set a monthly savings goal you can track against cash on hand."
      />

      <section className="glass-panel form-panel">
        <label className="field">
          <span>Display name</span>
          <input
            onChange={(event) => {
              setDisplayName(event.target.value)
              setShowSaved(false)
            }}
            placeholder="Aarav"
            value={displayName}
          />
        </label>

        <label className="field">
          <span>Monthly savings goal</span>
          <input
            inputMode="decimal"
            onChange={(event) => {
              setSavingsGoal(event.target.value)
              setShowSaved(false)
            }}
            placeholder="5000"
            value={savingsGoal}
          />
        </label>

        {showSaved ? (
          <p className="inline-feedback inline-feedback-success" aria-live="polite">
            Profile saved locally.
          </p>
        ) : null}

        <div className="button-row">
          <button
            className="button button-primary"
            onClick={() => {
              const parsedGoal = Number(savingsGoal)
              setCurrentUser(displayName.trim())
              updateProfile({
                savingsGoalRupees:
                  Number.isFinite(parsedGoal) && parsedGoal > 0 ? parsedGoal : 0,
              })
              setShowSaved(true)
            }}
            type="button"
          >
            Save profile
          </button>
          <Link className="button button-secondary" to="/budget">
            Open budget planner
          </Link>
        </div>
      </section>

      <section className="glass-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Snapshot</p>
            <h3>Current position</h3>
          </div>
        </div>

        <div className="metric-grid">
          <div>
            <span>Saved name</span>
            <strong>{state.currentUser || 'Not set'}</strong>
          </div>
          <div>
            <span>Cash on hand</span>
            <strong>{formatRupees(cashBalance)}</strong>
          </div>
          <div>
            <span>Tracked spend this month</span>
            <strong>{formatRupees(monthlySpend)}</strong>
          </div>
          <div>
            <span>Savings goal</span>
            <strong>{formatRupees(state.profile.savingsGoalRupees)}</strong>
          </div>
        </div>
      </section>
    </div>
  )
}
