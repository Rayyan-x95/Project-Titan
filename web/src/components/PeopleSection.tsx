import { memo } from 'react'
import { Link } from 'react-router-dom'
import { getPersonBalances, formatPaise } from '../lib/finance'
import type { TitanState } from '../types'

export const PeopleSection = memo(({ state, hasActivity }: {
  state: TitanState, 
  hasActivity: boolean 
}) => {
  const balances = getPersonBalances(state.splits, state.currentUser)

  return (
    <article className="glass-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">People</p>
          <h3>Who needs your attention</h3>
        </div>
        <Link className="inline-link" to="/history">
          Open history
        </Link>
      </div>

      <div className="list-block">
        {balances.length === 0 ? (
          <p className="muted-copy">
            {hasActivity
              ? 'No outstanding balances right now.'
              : 'Your people ledger will appear here after your first split.'}
          </p>
        ) : (
          balances.map((balance) => (
            <Link
              key={balance.personId}
              className="list-row"
              to={`/people/${encodeURIComponent(balance.personId)}`}
            >
              <div>
                <strong>{balance.personId}</strong>
                <span>
                  {balance.amountPaise >= 0 ? 'Owes you' : 'You owe'} this person
                </span>
              </div>
              <strong
                className={
                  balance.amountPaise >= 0 ? 'amount-positive' : 'amount-negative'
                }
              >
                {formatPaise(balance.amountPaise)}
              </strong>
            </Link>
          ))
        )}
      </div>
    </article>
  )
})