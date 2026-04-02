import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { formatDate, formatRupees } from '../lib/finance'
import { useTitan } from '../state/useTitan'

export function EmiPage() {
  const { state, addEmi } = useTitan()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const MAX_AMOUNT_RUPEES = 10_000_000

  return (
    <div className="page">
      <PageHeader
        eyebrow="EMI / Tracker"
        title="Recurring load"
        description="EMIs still drive the financial health score on the web port, so this surface stays operational instead of decorative."
      />

      <section className="glass-panel form-panel">
        <label className="field">
          <span>EMI name</span>
          <input
            onChange={(event) => setName(event.target.value)}
            placeholder="Phone upgrade"
            value={name}
          />
        </label>

        <label className="field">
          <span>Monthly amount</span>
          <input
            inputMode="decimal"
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0"
            value={amount}
          />
        </label>

        <div className="button-row">
          <button
            className="button button-primary"
            onClick={() => {
              const value = Number(amount)
              if (name.trim() && Number.isFinite(value) && value > 0 && value <= MAX_AMOUNT_RUPEES) {
                addEmi(name.trim(), value)
                setName('')
                setAmount('')
              }
            }}
            type="button"
          >
            Add EMI
          </button>
        </div>
      </section>

      <section className="glass-panel">
        <div className="list-block">
          {state.emis.map((emi) => (
            <article key={emi.id} className="list-row list-row-static">
              <div>
                <strong>{emi.name}</strong>
                <span>Due {formatDate(emi.dueDate)}</span>
              </div>
              <strong>{formatRupees(emi.amountRupees)}</strong>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
