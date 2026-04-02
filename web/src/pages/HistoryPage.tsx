import { PageHeader } from '../components/PageHeader'
import {
  formatDate,
  formatPaise,
  getOutstandingAmountPaise,
  getSettledAmountPaise,
  isSplitSettled,
} from '../lib/finance'
import { useTitan } from '../state/useTitan'

export function HistoryPage() {
  const { state } = useTitan()
  const history = [...state.splits].sort((left, right) => right.createdAt - left.createdAt)

  return (
    <div className="page">
      <PageHeader
        eyebrow="Global / History"
        title="All split activity"
        description="A single timeline for the full ledger, including group expenses and partially settled items."
      />

      <section className="glass-panel">
        <div className="list-block">
          {history.map((split) => (
            <article key={split.id} className="list-row list-row-static">
              <div>
                <strong>{split.description}</strong>
                <span>
                  {formatDate(split.createdAt)} - paid by {split.paidBy}
                </span>
              </div>
              <div className="row-actions">
                <strong>{formatPaise(split.amountPaise)}</strong>
                <span className="pill">
                  {isSplitSettled(split)
                    ? 'Settled'
                    : getSettledAmountPaise(split) > 0
                      ? `Partial - ${formatPaise(getOutstandingAmountPaise(split))} left`
                      : 'Pending'}
                </span>
              </div>
            </article>
          ))}
          {history.length === 0 ? (
            <p className="muted-copy">
              No split activity yet. Add an expense to start building the ledger.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  )
}
