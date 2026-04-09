import { memo, useMemo } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getBudgetSummary, getCurrentMonthTrackedSpendRupees, getHealthScore, mapReverseInsight, getSpendTrends } from '../lib/finance'
import type { TitanState } from '../types'

export const HealthInsightsSection = memo(({ state }: { state: TitanState }) => {
  const shouldReduceMotion = useReducedMotion()
  // Memoize expensive computations
  const health = useMemo(() => {
    return getHealthScore(state.emis, state.splits)
  }, [state.emis, state.splits])
  
  const trends = useMemo(() => {
    return getSpendTrends(state.splits, state.cashEntries, state.transactions)
  }, [state.splits, state.cashEntries, state.transactions])
  
  const reverseInsight = useMemo(() => {
    return mapReverseInsight(trends[0]?.totalRupees ?? 0)
  }, [trends])

  const budgetSummary = useMemo(() => {
    return getBudgetSummary(
      state.budget.monthlyLimitRupees,
      getCurrentMonthTrackedSpendRupees(state),
      state.budget.warningThresholdPercent,
    )
  }, [state])

  return (
    <div className="stack-column">
      <article className="glass-panel compact-panel">
        <p className="eyebrow">Health score</p>
        <div className="inline-split">
          <strong className={`status-${health.status.toLowerCase()}`}>{health.score}%</strong>
          <span>{health.status}</span>
        </div>
        <div className="metric-progress" aria-hidden="true">
          <m.div
            className="metric-progress-fill"
            initial={shouldReduceMotion ? false : { scaleX: 0.2, opacity: 0.7 }}
            animate={shouldReduceMotion ? { width: `${health.score}%` } : { scaleX: 1, opacity: 1, width: `${health.score}%` }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.36, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </div>
        <p>{health.recommendation}</p>
        <Link className="inline-link" to="/insights/health">
          Open full diagnosis
        </Link>
      </article>

      <article className="glass-panel compact-panel">
        <p className="eyebrow">Relativity</p>
        <strong>{`INR ${Math.round(reverseInsight.amountRupees * 100) / 100}`}</strong>
        <p>This week feels like {reverseInsight.valueInContext}.</p>
        <Link className="inline-link" to="/insights">
          See insights hub
        </Link>
      </article>

      <article className="glass-panel compact-panel">
        <p className="eyebrow">Budget</p>
        <strong>
          {budgetSummary.status === 'NOT_SET'
            ? 'Not set'
            : `${budgetSummary.percentUsed}% used`}
        </strong>
        <p>{budgetSummary.recommendation}</p>
        <Link className="inline-link" to="/budget">
          Open budget planner
        </Link>
      </article>
    </div>
  )
})
