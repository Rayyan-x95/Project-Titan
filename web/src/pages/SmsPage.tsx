import { PageHeader } from '../components/PageHeader'
import { formatDate, formatRupees } from '../lib/finance'
import { useTitan } from '../state/useTitan'

export function SmsPage() {
  const { state, approveTransaction, deleteTransaction } = useTitan()
  const pending = state.transactions.filter((transaction) => !transaction.isApproved)

  return (
    <div className="page">
      <PageHeader
        eyebrow="Detected / SMS"
        title="Bank alert approval queue"
        description="Android SMS parsing becomes a web review queue here. Approvals still feed the spending insight logic, but the web version expects you to populate this queue with real data."
      />

      <section className="glass-panel">
        <div className="list-block">
          {pending.length === 0 ? (
            <p className="muted-copy">No pending alerts right now.</p>
          ) : (
            pending.map((transaction) => (
              <article key={transaction.id} className="list-row list-row-static">
                <div>
                  <strong>{transaction.merchant}</strong>
                  <span>
                    {transaction.type} · {formatDate(transaction.timestamp)}
                  </span>
                </div>
                <div className="row-actions">
                  <strong>{formatRupees(transaction.amountRupees)}</strong>
                  <button
                    className="button button-secondary button-small"
                    onClick={() => approveTransaction(transaction.id)}
                    type="button"
                  >
                    Approve
                  </button>
                  <button
                    className="button button-small button-ghost"
                    onClick={() => deleteTransaction(transaction.id)}
                    type="button"
                  >
                    Ignore
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
