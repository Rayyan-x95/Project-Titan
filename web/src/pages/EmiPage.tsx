import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { formatDate, formatRupees } from '../lib/finance'
import { useTitan } from '../state/useTitan'

export function EmiPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { state, addEmi, updateEmi, deleteEmi } = useTitan()
  const editEmiId = searchParams.get('edit') ?? ''
  const editEmi = state.emis.find((emi) => emi.id === editEmiId)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const MAX_AMOUNT_RUPEES = 10_000_000

  useEffect(() => {
    if (!editEmi) {
      return
    }

    setName(editEmi.name)
    setAmount(String(editEmi.amountRupees))
  }, [editEmi])

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
                if (editEmi) {
                  updateEmi({ emiId: editEmi.id, name: name.trim(), amountRupees: value })
                } else {
                  addEmi(name.trim(), value)
                }
                setName('')
                setAmount('')
                setSearchParams({})
              }
            }}
            type="button"
          >
            {editEmi ? 'Update EMI' : 'Add EMI'}
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
              <div className="row-actions">
                <strong>{formatRupees(emi.amountRupees)}</strong>
                <button
                  className="button button-secondary button-small"
                  onClick={() => setSearchParams({ edit: emi.id })}
                  type="button"
                >
                  Edit
                </button>
                <button
                  className="button button-ghost button-small"
                  onClick={() => deleteEmi(emi.id)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
