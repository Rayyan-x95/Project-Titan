import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import {
  formatRupees,
  getHealthScore,
  getSpendTrends,
  getSpendingTriggers,
} from '../lib/finance'
import { useTitanState } from '../state/useTitan'

function buildPath(values: number[]) {
  if (values.length === 0) {
    return 'M0 120'
  }

  const max = Math.max(...values, 1)
  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 500
      const y = 200 - (value / max) * 160
      return `${index === 0 ? 'M' : 'L'}${x} ${y}`
    })
    .join(' ')
}

export default function InsightsPage() {
  const state = useTitanState()
  const trends = getSpendTrends(state.splits, state.cashEntries, state.transactions)
  const health = getHealthScore(state.emis, state.splits)
  const triggers = getSpendingTriggers(state.splits, state.transactions)
  const hasData =
    state.splits.length > 0 || state.cashEntries.length > 0 || state.transactions.length > 0
  const chartValues = trends.map((trend) => trend.totalRupees)
  const chartPath = buildPath(chartValues)

  return (
    <div className="page">
      <PageHeader
        eyebrow="Pulse / Insights"
        title="Live financial diagnostics"
        description="View real-time financial diagnostics powered by your actual Titan activity."
      />

      <section className="glass-panel insights-chart-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Trend line</p>
            <h3>Spend over time</h3>
          </div>
          <strong className={`status-${health.status.toLowerCase()}`}>{health.score}%</strong>
        </div>

        <svg className="insights-chart" viewBox="0 0 500 220" preserveAspectRatio="none">
          <defs>
            <linearGradient id="growthGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--tertiary)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--tertiary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${chartPath} L500 220 L0 220 Z`} fill="url(#growthGlow)" />
          <path d={chartPath} fill="none" stroke="var(--tertiary)" strokeWidth="3" strokeLinecap="round" />
        </svg>

        <div className="trend-labels">
          {trends.map((trend) => (
            <div key={trend.timeLabel}>
              <span>{trend.timeLabel}</span>
              <strong>{formatRupees(trend.totalRupees)}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="content-grid">
        <article className="glass-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Health</p>
              <h3>{health.status}</h3>
            </div>
            <Link className="inline-link" to="/insights/health">
              Open detail
            </Link>
          </div>
          <p className="brand-copy">{health.recommendation}</p>
        </article>

        <article className="glass-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Patterns</p>
              <h3>Behavioral triggers</h3>
            </div>
            <Link className="inline-link" to="/insights/triggers">
              Open detail
            </Link>
          </div>
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
          </div>
        </article>
      </section>

      <section className="glass-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Breakdown</p>
            <h3>Actual totals</h3>
          </div>
        </div>

        <div className="metric-grid">
          <div>
            <span>Cash on hand</span>
            <strong>
              {formatRupees(
                state.cashEntries.reduce(
                  (total, entry) => total + (entry.type === 'IN' ? entry.amountRupees : -entry.amountRupees),
                  0,
                ),
              )}
            </strong>
          </div>
          <div>
            <span>Active EMIs</span>
            <strong>
              {formatRupees(
                state.emis.filter((emi) => emi.isActive).reduce((total, emi) => total + emi.amountRupees, 0),
              )}
            </strong>
          </div>
          <div>
            <span>Pending splits</span>
            <strong>{formatRupees(state.splits.reduce((total, split) => total + split.amountPaise / 100, 0))}</strong>
          </div>
          <div>
            <span>Data state</span>
            <strong>{hasData ? 'Live' : 'Empty'}</strong>
          </div>
        </div>
      </section>
    </div>
  )
}
