import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import {
  formatRupees,
  getAlwaysPaysFirstPercentage,
  getHealthScore,
  getSpendTrends,
  getSpendingTriggers,
  isOverspending,
  mapReverseInsight,
} from '../lib/finance'
import { useTitan } from '../state/useTitan'

export function InsightsPage() {
  const { state } = useTitan()
  const hasData =
    state.splits.length > 0 ||
    state.transactions.length > 0 ||
    state.cashEntries.length > 0 ||
    state.emis.length > 0
  const trends = getSpendTrends(state.splits, state.cashEntries, state.transactions)
  const health = getHealthScore(state.emis, state.splits)
  const triggers = getSpendingTriggers(state.splits, state.transactions)
  const overspending = isOverspending(state.splits, state.transactions)
  const reverse = mapReverseInsight(trends[0]?.totalRupees ?? 0)
  const payFirst = getAlwaysPaysFirstPercentage(state.splits, state.currentUser)

  return (
    <div className="page">
      <PageHeader
        eyebrow="Financial / Insights"
        title="Behavior and pressure points"
        description={
          hasData
            ? 'This keeps the Kotlin insight layer intact in spirit: health score, pattern watch, trigger detection, and contextual money storytelling.'
            : 'Insights will populate after you add real splits, cash flow, transactions, or EMI entries.'
        }
      />
      {hasData ? (
        <>
          <section className="content-grid">
            <article className="glass-panel compact-panel">
              <p className="eyebrow">Health</p>
              <strong className={`status-${health.status.toLowerCase()}`}>{health.score}%</strong>
              <p>{health.recommendation}</p>
              <Link className="inline-link" to="/insights/health">
                View full score
              </Link>
            </article>

            <article className="glass-panel compact-panel">
              <p className="eyebrow">Patterns</p>
              <strong>{formatRupees(trends[0]?.totalRupees ?? 0)}</strong>
              <p>Current week outflow across splits, cash, and approved alerts.</p>
              <Link className="inline-link" to="/insights/patterns">
                Open pattern view
              </Link>
            </article>

            <article className="glass-panel compact-panel">
              <p className="eyebrow">Triggers</p>
              <strong>{triggers[0]?.title ?? 'Stable'}</strong>
              <p>{triggers[0]?.description}</p>
              <Link className="inline-link" to="/insights/triggers">
                Review all triggers
              </Link>
            </article>
          </section>

          <section className="glass-panel">
            <div className="metric-grid">
              <div>
                <span>Overspending</span>
                <strong>{overspending ? 'Risk flagged' : 'In control'}</strong>
              </div>
              <div>
                <span>Pay-first ratio</span>
                <strong>{payFirst}%</strong>
              </div>
              <div>
                <span>Relativity</span>
                <strong>{reverse.valueInContext}</strong>
              </div>
              <div>
                <span>Weekly volume</span>
                <strong>{formatRupees(reverse.amountRupees)}</strong>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="glass-panel empty-panel">
          <p className="eyebrow">No insight data yet</p>
          <h3>Add financial activity first</h3>
          <p className="muted-copy">
            Approve transactions, log cash movement, add EMIs, or create a split. Titan
            will compute health, trends, and triggers from those real entries.
          </p>
        </section>
      )}
    </div>
  )
}
