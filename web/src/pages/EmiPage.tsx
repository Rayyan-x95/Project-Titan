import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { formatDate, formatRupees } from '../lib/finance'
import type { TitanState } from '../types'
import { useTitanActions, useTitanState } from '../state/useTitan'

export function EmiPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const state = useTitanState()
  const { addEmi, updateEmi, deleteEmi } = useTitanActions()
  const editEmiId = searchParams.get('edit') ?? ''
  const editEmi = state.emis.find((emi) => emi.id === editEmiId)
  const MAX_AMOUNT_RUPEES = 10_000_000

  return (
    <EmiEditor
      addEmi={addEmi}
      deleteEmi={deleteEmi}
      editEmi={editEmi}
      key={editEmi?.id ?? 'new'}
      maxAmountRupees={MAX_AMOUNT_RUPEES}
      state={state}
      setSearchParams={setSearchParams}
      updateEmi={updateEmi}
    />
  )
}

type EmiEditorProps = {
  addEmi: (name: string, amountRupees: number) => void
  deleteEmi: (emiId: string) => void
  editEmi?: {
    id: string
    name: string
    amountRupees: number
    dueDate: number
  }
  maxAmountRupees: number
  state: TitanState
  setSearchParams: ReturnType<typeof useSearchParams>[1]
  updateEmi: (payload: { emiId: string; name: string; amountRupees: number }) => void
}

function EmiEditor({
  addEmi,
  deleteEmi,
  editEmi,
  maxAmountRupees,
  state,
  setSearchParams,
  updateEmi,
}: EmiEditorProps) {
  const [name, setName] = useState(editEmi?.name ?? '')
  const [amount, setAmount] = useState(editEmi ? String(editEmi.amountRupees) : '')

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
              if (name.trim() && Number.isFinite(value) && value > 0 && value <= maxAmountRupees) {
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
