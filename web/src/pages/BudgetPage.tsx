import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { getBudgetSummary, getCurrentMonthTrackedSpendRupees, formatRupees } from '../lib/finance'
import { useTitanActions, useTitanState } from '../state/useTitan'

export function BudgetPage() {
  const state = useTitanState()
  const { updateBudget } = useTitanActions()
  const [monthlyLimit, setMonthlyLimit] = useState(
    state.budget.monthlyLimitRupees > 0 ? String(state.budget.monthlyLimitRupees) : '',
  )
  const [warningThreshold, setWarningThreshold] = useState(state.budget.warningThresholdPercent)
  const [showSaved, setShowSaved] = useState(false)
  const trackedSpendRupees = getCurrentMonthTrackedSpendRupees(state)
  const budgetSummary = getBudgetSummary(
    state.budget.monthlyLimitRupees,
    trackedSpendRupees,
    state.budget.warningThresholdPercent,
  )

  return (
    <div className="page">
      <PageHeader
        eyebrow="Budget / Monthly pacing"
        title="Monthly spending guardrails"
        description="Set a monthly tracked-spend limit and let Titan alert you when the month is getting tight."
      />

      <section className="glass-panel form-panel">
        <label className="field">
          <span>Monthly budget limit</span>
          <input
            inputMode="decimal"
            onChange={(event) => setMonthlyLimit(event.target.value)}
            placeholder="12000"
            value={monthlyLimit}
          />
        </label>

        <label className="field">
          <span>Warning threshold (%)</span>
          <input
            inputMode="numeric"
            max="100"
            min="1"
            onChange={(event) => {
              const value = Number(event.target.value)
              setWarningThreshold(Number.isFinite(value) ? value : 0)
            }}
            placeholder="80"
            type="number"
            value={warningThreshold}
          />
        </label>

        {showSaved ? (
          <p className="inline-feedback inline-feedback-success" aria-live="polite">
            Budget saved locally.
          </p>
        ) : null}

        <div className="button-row">
          <button
            className="button button-primary"
            onClick={() => {
              const parsedLimit = Number(monthlyLimit)
              const parsedThreshold = warningThreshold
              const normalizedThreshold =
                Number.isFinite(parsedThreshold) && parsedThreshold > 0 && parsedThreshold <= 100
                  ? parsedThreshold
                  : 80

              updateBudget({
                monthlyLimitRupees:
                  Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 0,
                warningThresholdPercent: normalizedThreshold,
              })
              setShowSaved(true)
            }}
            type="button"
          >
            Save budget
          </button>
          <button
            className="button button-ghost"
            onClick={() => {
              setMonthlyLimit('')
              setWarningThreshold(80)
              updateBudget({ monthlyLimitRupees: 0, warningThresholdPercent: 80 })
              setShowSaved(true)
            }}
            type="button"
          >
            Reset
          </button>
        </div>
      </section>

      <section className="glass-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">This month</p>
            <h3>{budgetSummary.status === 'NOT_SET' ? 'No budget yet' : budgetSummary.status}</h3>
          </div>
          <Link className="inline-link" to="/history">
            Review ledger
          </Link>
        </div>

        <div className="metric-grid">
          <div>
            <span>Tracked spend</span>
            <strong>{formatRupees(budgetSummary.trackedSpendRupees)}</strong>
          </div>
          <div>
            <span>Budget limit</span>
            <strong>{formatRupees(budgetSummary.monthlyLimitRupees)}</strong>
          </div>
          <div>
            <span>Remaining</span>
            <strong>{formatRupees(budgetSummary.remainingRupees)}</strong>
          </div>
          <div>
            <span>Budget used</span>
            <strong>{budgetSummary.percentUsed}%</strong>
          </div>
        </div>

        <p className="brand-copy">{budgetSummary.recommendation}</p>
      </section>
    </div>
  )
}
