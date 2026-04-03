import { PageHeader } from '../components/PageHeader'
import {
  formatRupees,
  getHealthScore,
  getSpendTrends,
  getSpendingTriggers,
} from '../lib/finance'
import { useTitanState } from '../state/useTitan'

export function PatternsPage() {
  const state = useTitanState()
  const hasData =
    state.splits.length > 0 ||
    state.transactions.length > 0 ||
    state.cashEntries.length > 0
  const trends = getSpendTrends(state.splits, state.cashEntries, state.transactions)

  return (
    <div className="page">
      <PageHeader
        eyebrow="Spending / Patterns"
        title="Timeline readout"
        description="Blended spend volume from splits, cash outflow, and approved transaction alerts."
      />

      <section className="glass-panel">
        <div className="list-block">
          {trends.map((trend) => (
            <article key={trend.timeLabel} className="list-row list-row-static">
              <div>
                <strong>{trend.timeLabel}</strong>
                <span>
                  Split share {formatRupees(trend.splitShareRupees)} · Cash{' '}
                  {formatRupees(trend.cashSpentRupees)}
                </span>
              </div>
              <strong>{formatRupees(trend.totalRupees)}</strong>
            </article>
          ))}
          {!hasData ? (
            <p className="muted-copy">
              No trend data yet. Add split, cash, or transaction activity to generate
              patterns.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export function TriggersPage() {
  const state = useTitanState()
  const hasData = state.splits.length > 0 || state.transactions.length > 0
  const triggers = getSpendingTriggers(state.splits, state.transactions)

  return (
    <div className="page">
      <PageHeader
        eyebrow="Behavioral / Triggers"
        title="What is shaping spend"
        description="Simple heuristic triggers carried over from the Android prototype and presented as a clean web diagnosis list."
      />

      <section className="glass-panel">
        <div className="list-block">
          {triggers.map((trigger) => (
            <article key={trigger.title} className="list-row list-row-static">
              <div>
                <strong>{trigger.title}</strong>
                <span>{trigger.description}</span>
              </div>
              <strong>{trigger.impact}</strong>
            </article>
          ))}
          {!hasData ? (
            <p className="muted-copy">
              Trigger detection starts after your first real split or transaction.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export function HealthPage() {
  const state = useTitanState()
  const hasData = state.splits.length > 0 || state.emis.length > 0
  const health = getHealthScore(state.emis, state.splits)

  return (
    <div className="page">
      <PageHeader
        eyebrow="Financial / Health"
        title={`${health.score}%`}
        description={health.recommendation}
      />

      {hasData ? (
        <section className="glass-panel health-panel">
          <div className={`health-ring health-ring-${health.status.toLowerCase()}`}>
            <div className="health-core">
              <span className={`status-${health.status.toLowerCase()}`}>{health.status}</span>
              <strong>{health.score}%</strong>
            </div>
          </div>
        </section>
      ) : (
        <section className="glass-panel empty-panel">
          <p className="eyebrow">No health inputs yet</p>
          <h3>Add splits or EMI entries</h3>
          <p className="muted-copy">
            Titan needs actual liabilities or shared expenses before it can rate
            your financial health.
          </p>
        </section>
      )}
    </div>
  )
}
