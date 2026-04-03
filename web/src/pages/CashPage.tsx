import { useState } from 'react'
import { TitanSegmentedControl } from '../components/TitanSegmentedControl'
import { useTitanActions, useTitanState } from '../state/useTitan'
import { formatDate, formatRupees, getCashBalance } from '../lib/finance'
import { parseAmountInput } from '../lib/input'

export default function CashPage() {
  const state = useTitanState()
  const { addCashEntry } = useTitanActions()
  const [amount, setAmount] = useState('')
  const [entryType, setEntryType] = useState<'IN' | 'OUT'>('IN')
  const totalBalance = getCashBalance(state.cashEntries)

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Cash / Arsenal</p>
          <h1>Track in-hand flow</h1>
          <p className="page-description">
            Cash tracking now has a real input form so the vault balance is based on actual entries.
          </p>
        </div>
      </header>

      <section className="glass-panel">
        <p className="eyebrow">Current balance</p>
        <strong className="display-value">{formatRupees(totalBalance)}</strong>
      </section>

      <section className="glass-panel form-panel">
        <label className="field">
          <span>Amount</span>
          <input inputMode="decimal" onChange={(event) => setAmount(event.target.value)} placeholder="0" value={amount} />
        </label>

        <TitanSegmentedControl
          label="Entry type"
          options={[
            { value: 'IN', label: 'Cash in' },
            { value: 'OUT', label: 'Cash out' },
          ]}
          onChange={(nextValue) => setEntryType(nextValue as 'IN' | 'OUT')}
          value={entryType}
        />

        <div className="button-row">
          <button
            className="button button-primary"
            onClick={() => {
              const parsedAmount = parseAmountInput(amount)
              if (parsedAmount !== null && parsedAmount > 0) {
                addCashEntry(parsedAmount, entryType)
                setAmount('')
              }
            }}
            type="button"
          >
            Save cash entry
          </button>
        </div>
      </section>

      <section className="glass-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">History</p>
            <h3>Cash movements</h3>
          </div>
        </div>

        <div className="list-block">
          {state.cashEntries.length === 0 ? (
            <p className="muted-copy">No cash entries yet.</p>
          ) : (
            state.cashEntries.map((entry) => (
              <article key={entry.id} className="list-row list-row-static">
                <div>
                  <strong>{entry.type === 'IN' ? 'Cash in' : 'Cash out'}</strong>
                  <span>{formatDate(entry.createdAt)}</span>
                </div>
                <strong className={entry.type === 'IN' ? 'amount-positive' : 'amount-negative'}>
                  {formatRupees(entry.amountRupees)}
                </strong>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
