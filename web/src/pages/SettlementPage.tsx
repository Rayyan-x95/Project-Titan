import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { QRShareModal } from '../features/qr-share/components/QRShareModal'
import { useQRShare } from '../features/qr-share/hooks/useQRShare'
import { createQrSharePayload } from '../features/qr-share/services/qrShareService'
import { createShareLink } from '../features/share-links/services/shareLinkService'
import {
  formatPaise,
  getOutstandingAmountPaise,
  getParticipantOutstandingPaise,
  getParticipantSettledPaise,
  getParticipantSharePaise,
  getSettlementParticipantId,
  MAX_AMOUNT_PAISE,
} from '../lib/finance'
import { useTitanActions, useTitanState } from '../state/useTitan'

export function SettlementPage() {
  const navigate = useNavigate()
  const params = useParams()
  const [searchParams] = useSearchParams()
  const splitId = params.splitId ?? ''
  const personId = searchParams.get('person')
    ? decodeURIComponent(searchParams.get('person') ?? '')
    : ''
  const state = useTitanState()
  const { settleFull, settlePartial } = useTitanActions()
  const split = state.splits.find((item) => item.id === splitId)
  const [amount, setAmount] = useState('')
  const shareableUrl = split
    ? createShareLink('summary', `/settlements/${split.id}`, {
        person: personId,
        description: split.description,
        pendingPaise: getParticipantOutstandingPaise(
          split,
          getSettlementParticipantId(split, state.currentUser, personId) ?? '',
        ),
      })
    : ''
  const { open, imageUrl, openModal, closeModal } = useQRShare(shareableUrl)

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
  const qrPayload = createQrSharePayload(
    'Titan settlement summary',
    `${split.description}: ${formatPaise(participantOutstandingPaise)} pending`,
    shareableUrl,
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
          <button
            className="button button-primary"
            onClick={() => {
              const parsedAmount = Number(amount)
              if (!Number.isFinite(parsedAmount)) {
                return
              }

              const amountPaise = Math.round(parsedAmount * 100)
              if (
                amountPaise > 0 &&
                amountPaise <= MAX_AMOUNT_PAISE &&
                amountPaise <= participantOutstandingPaise
              ) {
                settlePartial(split.id, participantId, amountPaise)
                navigate(-1)
              }
            }}
            type="button"
          >
            Record partial
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
        </div>

        <div className="button-row">
          <button className="button button-ghost" onClick={() => navigate(-1)} type="button">
            Cancel
          </button>
          <button className="button button-ghost" onClick={openModal} type="button">
            Share as QR
          </button>
        </div>

        <a
          className="inline-link"
          href={`mailto:?subject=Titan settlement reminder&body=${shareLink}`}
        >
          Share reminder
        </a>
      </section>

      <QRShareModal
        imageUrl={imageUrl}
        onClose={closeModal}
        open={open}
        scanValue={shareableUrl || qrPayload}
        subtitle="Scan to view this settlement"
        title="Settlement summary"
      />
    </div>
  )
}
