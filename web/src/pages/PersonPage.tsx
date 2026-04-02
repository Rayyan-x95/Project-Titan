import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import {
  formatDate,
  formatPaise,
  getPersonBalances,
  getPersonSplitOutstandingPaise,
  getSplitsForPerson,
  isSplitSettled,
} from '../lib/finance'
import { useTitan } from '../state/useTitan'

export function PersonPage() {
  const params = useParams()
  const personId = params.personId ? decodeURIComponent(params.personId) : ''
  const { state } = useTitan()
  const balances = getPersonBalances(state.splits, state.currentUser)
  const balance = balances.find((item) => item.personId === personId)?.amountPaise ?? 0
  const splits = getSplitsForPerson(state.splits, state.currentUser, personId)
  const reminder = encodeURIComponent(
    `Hey ${personId}, quick reminder from Titan. Outstanding balance: ${formatPaise(balance)}.`,
  )

  return (
    <div className="page">
      <PageHeader
        eyebrow="Person / Detail"
        title={personId || 'Unknown person'}
        description={
          balance >= 0
            ? `${personId} currently owes you ${formatPaise(balance)}.`
            : `You currently owe ${personId} ${formatPaise(Math.abs(balance))}.`
        }
        action={
          <a
            className="button button-secondary"
            href={`https://wa.me/?text=${reminder}`}
            rel="noreferrer"
            target="_blank"
          >
            Send reminder
          </a>
        }
      />

      <section className="glass-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Ledger</p>
            <h3>Shared history</h3>
          </div>
          <strong className={balance >= 0 ? 'amount-positive' : 'amount-negative'}>
            {formatPaise(balance)}
          </strong>
        </div>

        <div className="list-block">
          {splits.map((split) => {
            const outstandingPaise = getPersonSplitOutstandingPaise(
              split,
              state.currentUser,
              personId,
            )

            return (
              <article key={split.id} className="list-row list-row-static">
                <div>
                  <strong>{split.description}</strong>
                  <span>
                    {formatDate(split.createdAt)} - paid by {split.paidBy}
                  </span>
                </div>

                <div className="row-actions">
                  <strong>{formatPaise(outstandingPaise)}</strong>
                  {!isSplitSettled(split) && outstandingPaise > 0 ? (
                    <Link
                      className="button button-secondary button-small"
                      to={`/settlements/${split.id}?person=${encodeURIComponent(personId)}`}
                    >
                      Settle
                    </Link>
                  ) : (
                    <span className="pill">Settled</span>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
