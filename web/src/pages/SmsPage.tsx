import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { formatDate, formatRupees } from '../lib/finance'
import { parseSmsAlert } from '../services/sms'
import { useTitanActions, useTitanState } from '../state/useTitan'

export function SmsPage() {
  const state = useTitanState()
  const { approveTransaction, deleteTransaction, ingestTransaction } = useTitanActions()
  const pending = state.transactions.filter((transaction) => !transaction.isApproved)
  const [message, setMessage] = useState('')
  const [parseError, setParseError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [isIngesting, setIsIngesting] = useState(false)

  return (
    <div className="page">
      <PageHeader
        eyebrow="Detected / SMS"
        title="Bank alert approval queue"
        description="Review parsed SMS bank alerts here. Approved entries feed insights and history with real transaction data."
      />

      <section className="glass-panel form-panel">
        <label className="field field-wide">
          <span>SMS alert text</span>
          <textarea
            className={parseError ? 'field-error-shake' : ''}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Transaction alert: INR 240 spent at Metro Mart"
            rows={4}
            value={message}
          />
        </label>

        {parseError ? <p className="inline-feedback inline-feedback-error">{parseError}</p> : null}
        {showSuccess ? (
          <p className="inline-feedback inline-feedback-success success-pop" aria-live="polite">
            SMS alert ingested.
          </p>
        ) : null}

        <div className="button-row">
          <button
            className="button button-primary"
            disabled={isIngesting}
            onClick={() => {
              setParseError('')
              setShowSuccess(false)
              setIsIngesting(true)
              const parsed = parseSmsAlert(message)

              if (!parsed) {
                setParseError('Titan could not parse this SMS. Include amount and merchant name.')
                setIsIngesting(false)
                return
              }

              ingestTransaction({
                merchant: parsed.merchant,
                amountRupees: parsed.amountRupees,
                type: 'SMS',
              })
              setMessage('')
              setShowSuccess(true)
              setIsIngesting(false)
            }}
            type="button"
          >
            Ingest alert
          </button>
        </div>
      </section>

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
