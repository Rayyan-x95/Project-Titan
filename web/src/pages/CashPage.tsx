import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { formatDate, formatRupees, getCashBalance } from '../lib/finance'
import { useTitan } from '../state/useTitan'

export function CashPage() {
  const { state, addCashEntry } = useTitan()
  const [amount, setAmount] = useState('')
  const cashBalance = getCashBalance(state.cashEntries)
  const MAX_AMOUNT_RUPEES = 10_000_000

  function parseAmount(input: string) {
    const value = Number(input)
    if (!Number.isFinite(value) || value <= 0 || value > MAX_AMOUNT_RUPEES) {
      return null
    }
    return value
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Cash / Balance"
        title={formatRupees(cashBalance)}
        description="Track in-hand money without leaving the main Titan workspace."
      />

      <section className="glass-panel form-panel">
        <label className="field">
          <span>Amount</span>
          <input
            inputMode="decimal"
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0"
            value={amount}
          />
        </label>

        <div className="button-row">
          <button
            className="button button-secondary"
            onClick={() => {
              const value = parseAmount(amount)
              if (value !== null) {
                addCashEntry(value, 'IN')
                setAmount('')
              }
            }}
            type="button"
          >
            Cash in
          </button>
          <button
            className="button button-primary"
            onClick={() => {
              const value = parseAmount(amount)
              if (value !== null) {
                addCashEntry(value, 'OUT')
                setAmount('')
              }
            }}
            type="button"
          >
            Cash out
          </button>
        </div>
      </section>

      <section className="glass-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">History</p>
            <h3>Cash flow ledger</h3>
          </div>
        </div>

        <div className="list-block">
          {state.cashEntries.map((entry) => (
            <article key={entry.id} className="list-row list-row-static">
              <div>
                <strong>{entry.type === 'IN' ? 'Cash received' : 'Cash spent'}</strong>
                <span>{formatDate(entry.createdAt)}</span>
              </div>
              <strong className={entry.type === 'IN' ? 'amount-positive' : 'amount-negative'}>
                {entry.type === 'IN' ? '+' : '-'}
                {formatRupees(entry.amountRupees)}
              </strong>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
