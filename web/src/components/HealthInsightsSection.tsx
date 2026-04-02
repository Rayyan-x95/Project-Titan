import { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getHealthScore, mapReverseInsight, getSpendTrends } from '../lib/finance'
import type { TitanState } from '../types'

export const HealthInsightsSection = memo(({ state }: { state: TitanState }) => {
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

  return (
    <div className="stack-column">
      <article className="glass-panel compact-panel">
        <p className="eyebrow">Health score</p>
        <div className="inline-split">
          <strong className={`status-${health.status.toLowerCase()}`}>{health.score}%</strong>
          <span>{health.status}</span>
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
    </div>
  )
})