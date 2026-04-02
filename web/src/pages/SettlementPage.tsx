import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import {
  formatPaise,
  getOutstandingAmountPaise,
  getParticipantOutstandingPaise,
  getParticipantSettledPaise,
  getParticipantSharePaise,
  getSettlementParticipantId,
} from '../lib/finance'
import { useTitan } from '../state/useTitan'

export function SettlementPage() {
  const navigate = useNavigate()
  const params = useParams()
  const [searchParams] = useSearchParams()
  const splitId = params.splitId ?? ''
  const personId = searchParams.get('person')
    ? decodeURIComponent(searchParams.get('person') ?? '')
    : ''
  const { state, settleFull, settlePartial } = useTitan()
  const split = state.splits.find((item) => item.id === splitId)
  const [amount, setAmount] = useState('')
  const MAX_AMOUNT_PAISE = 10_000_000_00

  if (!split || !personId) {
    return (
      <div className="page">
        <PageHeader
          eyebrow="Settlement / Missing"
          title="Settlement record not found"
          description="This settlement may have been removed from local storage."
        />
      </div>
    )
  }

  const participantId = getSettlementParticipantId(split, state.currentUser, personId)

  if (!participantId) {
    return (
      <div className="page">
        <PageHeader
          eyebrow="Settlement / Missing"
          title="Relationship not found"
          description="Titan could not map this split to the selected person."
        />
      </div>
    )
  }

  const participantSharePaise = getParticipantSharePaise(split, participantId)
  const participantSettledPaise = getParticipantSettledPaise(split, participantId)
  const participantOutstandingPaise = getParticipantOutstandingPaise(split, participantId)
  const splitOutstandingPaise = getOutstandingAmountPaise(split)
  const shareLink = encodeURIComponent(
    `Settlement note from Titan: ${split.description} still has ${formatPaise(
      participantOutstandingPaise,
    )} pending between you and ${personId}.`,
  )
  const shareLabel =
    split.paidBy === state.currentUser ? `${personId}'s share` : 'Your share'
  const settledLabel =
    split.paidBy === state.currentUser
      ? `${personId} has settled`
      : 'You have settled'

  return (
    <div className="page">
      <PageHeader
        eyebrow="Settlement / Record"
        title={`Settle ${split.description}`}
        description={`${personId} still has ${formatPaise(
          participantOutstandingPaise,
        )} pending on this split.`}
      />

      <section className="glass-panel form-panel">
        <div className="metric-grid">
          <div>
            <span>Total split</span>
            <strong>{formatPaise(split.amountPaise)}</strong>
          </div>
          <div>
            <span>{shareLabel}</span>
            <strong>{formatPaise(participantSharePaise)}</strong>
          </div>
          <div>
            <span>{settledLabel}</span>
            <strong>{formatPaise(participantSettledPaise)}</strong>
          </div>
          <div>
            <span>Split still open</span>
            <strong>{formatPaise(splitOutstandingPaise)}</strong>
          </div>
        </div>

        <label className="field">
          <span>Partial payment</span>
          <input
            inputMode="decimal"
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0"
            value={amount}
          />
        </label>

        <div className="button-row">
          <button className="button button-secondary" onClick={() => navigate(-1)} type="button">
            Cancel
          </button>
          <button
            className="button button-secondary"
            onClick={() => {
              settleFull(split.id, participantId)
              navigate(-1)
            }}
            type="button"
          >
            Mark this share settled
          </button>
          <button
            className="button button-primary"
            onClick={() => {
              const parsedAmount = Number(amount)
              if (!Number.isFinite(parsedAmount)) {
                return
              }

              const amountPaise = Math.round(parsedAmount * 100)
              if (amountPaise > 0 && amountPaise <= MAX_AMOUNT_PAISE) {
                settlePartial(split.id, participantId, amountPaise)
                navigate(-1)
              }
            }}
            type="button"
          >
            Record partial
          </button>
        </div>

        <a
          className="inline-link"
          href={`mailto:?subject=Titan settlement reminder&body=${shareLink}`}
        >
          Share reminder
        </a>
      </section>
    </div>
  )
}
