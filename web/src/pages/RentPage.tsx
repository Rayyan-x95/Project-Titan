import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { formatDate, formatRupees } from '../lib/finance'
import { useTitan } from '../state/useTitan'

export function RentPage() {
  const navigate = useNavigate()
  const { state, triggerRentSplit } = useTitan()
  const hasCurrentUser = Boolean(state.currentUser)
  const [amount, setAmount] = useState('')
  const [members, setMembers] = useState('')
  const [recurring, setRecurring] = useState(true)
  const MAX_AMOUNT_PAISE = 10_000_000_00

  return (
    <div className="page">
      <PageHeader
        eyebrow="Rent / Monthly split"
        title="Trigger the next rent cycle"
        description="The Android recurring-rent flow becomes a one-shot web action that can still seed the monthly split into the shared ledger."
      />

      <section className="glass-panel form-panel">
        {!hasCurrentUser ? (
          <p className="muted-copy">
            Save your name in the sidebar first so Titan can create the rent split.
          </p>
        ) : null}
        <label className="field">
          <span>Rent amount</span>
          <input
            disabled={!hasCurrentUser}
            inputMode="decimal"
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0"
            value={amount}
          />
        </label>

        <label className="field field-wide">
          <span>Members</span>
          <textarea
            disabled={!hasCurrentUser}
            onChange={(event) => setMembers(event.target.value)}
            placeholder="Aarav, Meera, Kabir"
            rows={4}
            value={members}
          />
        </label>

        <label className="toggle-row">
          <input
            checked={recurring}
            disabled={!hasCurrentUser}
            onChange={(event) => setRecurring(event.target.checked)}
            type="checkbox"
          />
          <span>Mark as recurring monthly cycle</span>
        </label>

        <div className="button-row">
          <button
            className="button button-primary"
            disabled={!hasCurrentUser}
            onClick={() => {
              const parsedAmount = Number(amount)
              if (!Number.isFinite(parsedAmount)) {
                return
              }

              const amountPaise = Math.round(parsedAmount * 100)
              const memberList = members
                .split(',')
                .map((member) => member.trim())
                .filter(Boolean)

              if (amountPaise > 0 && amountPaise <= MAX_AMOUNT_PAISE && memberList.length > 0) {
                triggerRentSplit(amountPaise, memberList, recurring)
                navigate('/history')
              }
            }}
            type="button"
          >
            Trigger rent split
          </button>
        </div>
      </section>

      <section className="glass-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Schedules</p>
            <h3>Recurring rent cycles</h3>
          </div>
        </div>

        <div className="list-block">
          {state.rentSchedules.length === 0 ? (
            <p className="muted-copy">No recurring schedules are active yet.</p>
          ) : (
            state.rentSchedules.map((schedule) => (
              <article key={schedule.id} className="list-row list-row-static">
                <div>
                  <strong>{schedule.description}</strong>
                  <span>
                    {schedule.members.join(', ')} · Next run {formatDate(schedule.nextRunAt)}
                  </span>
                </div>
                <strong>{formatRupees(schedule.amountPaise / 100)}</strong>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
