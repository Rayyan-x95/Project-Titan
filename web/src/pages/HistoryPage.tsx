import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import {
  formatDate,
  formatPaise,
  formatRupees,
  getCashBalance,
} from '../lib/finance'
import { useTitan } from '../state/useTitan'

function downloadFile(filename: string, contents: string, mimeType: string) {
  const blob = new Blob([contents], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function toCsvValue(value: string | number | boolean) {
  return `"${String(value).replaceAll('"', '""')}"`
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const { state, deleteSplit, approveTransaction, deleteTransaction } = useTitan()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all')

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return [...state.transactions]
      .sort((left, right) => right.timestamp - left.timestamp)
      .filter((transaction) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          transaction.merchant.toLowerCase().includes(normalizedQuery) ||
          transaction.type.toLowerCase().includes(normalizedQuery)
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'approved' && transaction.isApproved) ||
          (statusFilter === 'pending' && !transaction.isApproved)

        return matchesQuery && matchesStatus
      })
  }, [query, state.transactions, statusFilter])

  const recentSplits = useMemo(
    () => [...state.splits].sort((left, right) => right.updatedAt - left.updatedAt),
    [state.splits],
  )

  const approvedTotal = filteredTransactions
    .filter((transaction) => transaction.isApproved)
    .reduce((total, transaction) => total + transaction.amountRupees, 0)
  const cashBalance = getCashBalance(state.cashEntries)

  return (
    <div className="page">
      <PageHeader
        eyebrow="Ledger / History"
        title="Transaction history"
        description="Search the transaction queue, export the current view, and manage expense splits from the same ledger surface."
        action={
          <div className="button-row">
            <button
              className="button button-secondary"
              onClick={() => {
                const payload = {
                  generatedAt: new Date().toISOString(),
                  cashBalance,
                  transactions: filteredTransactions,
                  splits: recentSplits,
                }

                downloadFile(
                  'titan-ledger.json',
                  JSON.stringify(payload, null, 2),
                  'application/json',
                )
              }}
              type="button"
            >
              Export JSON
            </button>
            <button
              className="button button-secondary"
              onClick={() => {
                const csvRows = [
                  ['merchant', 'amountRupees', 'type', 'timestamp', 'approved'].map(toCsvValue).join(','),
                  ...filteredTransactions.map((transaction) =>
                    [
                      transaction.merchant,
                      transaction.amountRupees,
                      transaction.type,
                      formatDate(transaction.timestamp),
                      transaction.isApproved,
                    ]
                      .map(toCsvValue)
                      .join(','),
                  ),
                ]

                downloadFile('titan-transactions.csv', csvRows.join('\n'), 'text/csv')
              }}
              type="button"
            >
              Export CSV
            </button>
          </div>
        }
      />

      <section className="glass-panel form-panel">
        <div className="metric-grid">
          <div>
            <span>Visible transactions</span>
            <strong>{filteredTransactions.length}</strong>
          </div>
          <div>
            <span>Approved total</span>
            <strong>{formatRupees(approvedTotal)}</strong>
          </div>
          <div>
            <span>Cash balance</span>
            <strong>{formatRupees(cashBalance)}</strong>
          </div>
          <div>
            <span>Expense splits</span>
            <strong>{recentSplits.length}</strong>
          </div>
        </div>

        <label className="field">
          <span>Search transactions</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="merchant or type"
            value={query}
          />
        </label>

        <label className="field">
          <span>Status</span>
          <select
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            value={statusFilter}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </label>
      </section>

      <section className="glass-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Transactions</p>
            <h3>Approval queue</h3>
          </div>
        </div>

        <div className="list-block">
          {filteredTransactions.length === 0 ? (
            <p className="muted-copy">No transactions match the current filter.</p>
          ) : (
            filteredTransactions.map((tx) => (
              <article key={tx.id} className="list-row list-row-static">
                <div>
                  <strong>{tx.merchant}</strong>
                  <span>
                    {tx.type} · {formatDate(tx.timestamp)}
                  </span>
                </div>
                <div className="row-actions">
                  <strong className={tx.isApproved ? 'amount-positive' : 'amount-negative'}>
                    {formatRupees(tx.amountRupees)}
                  </strong>
                  {tx.isApproved ? (
                    <span className="pill">Approved</span>
                  ) : (
                    <>
                      <button
                        className="button button-secondary button-small"
                        onClick={() => approveTransaction(tx.id)}
                        type="button"
                      >
                        Approve
                      </button>
                      <button
                        className="button button-ghost button-small"
                        onClick={() => deleteTransaction(tx.id)}
                        type="button"
                      >
                        Ignore
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="glass-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Splits</p>
            <h3>Recent expenses</h3>
          </div>
          <Link className="inline-link" to="/expense/new">
            Add split
          </Link>
        </div>

        <div className="list-block">
          {recentSplits.length === 0 ? (
            <p className="muted-copy">No splits recorded yet.</p>
          ) : (
            recentSplits.map((split) => (
              <article key={split.id} className="list-row list-row-static">
                <div>
                  <strong>{split.description}</strong>
                  <span>
                    {split.participants.join(', ')} · {formatDate(split.updatedAt)}
                  </span>
                </div>
                <div className="row-actions">
                  <strong>{formatPaise(split.amountPaise)}</strong>
                  <button
                    className="button button-secondary button-small"
                    onClick={() => navigate(`/expense/new?edit=${split.id}`)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="button button-ghost button-small"
                    onClick={() => deleteSplit(split.id)}
                    type="button"
                  >
                    Delete
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
