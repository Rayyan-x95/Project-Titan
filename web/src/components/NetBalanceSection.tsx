import { memo, useMemo } from 'react'
import { formatDate, formatPaise } from '../lib/finance'
import type { TitanState } from '../types'
import { 
  getPersonBalances, 
  getTotalOwedPaise, 
  getTotalOwePaise, 
  getSummaryInsights,
  getAlwaysPaysFirstPercentage
} from '../lib/finance'

export const NetBalanceSection = memo(({ state }: { state: TitanState }) => {
  const hasCurrentUser = Boolean(state.currentUser)
  
  // Memoize expensive computations
  const balances = useMemo(() => {
    return hasCurrentUser ? getPersonBalances(state.splits, state.currentUser) : []
  }, [state.splits, state.currentUser, hasCurrentUser])
  
  const totalOwedPaise = useMemo(() => {
    return hasCurrentUser ? getTotalOwedPaise(balances) : 0
  }, [balances, hasCurrentUser])
  
  const totalOwePaise = useMemo(() => {
    return hasCurrentUser ? getTotalOwePaise(balances) : 0
  }, [balances, hasCurrentUser])
  
  const summary = useMemo(() => {
    return hasCurrentUser
      ? getSummaryInsights(state.splits, state.currentUser)
      : { totalPendingAmountPaise: 0, peopleWhoOweCount: 0, oldestPendingSplit: undefined }
  }, [state.splits, state.currentUser, hasCurrentUser])
  
  const payFirst = useMemo(() => {
    return hasCurrentUser ? getAlwaysPaysFirstPercentage(state.splits, state.currentUser) : 0
  }, [state.splits, state.currentUser, hasCurrentUser])

  return (
    <section className="hero-grid">
      <div className={`glass-panel hero-panel ${hasCurrentUser ? 'hero-panel-visible' : 'hero-panel-hidden'}`}>
        <p className="eyebrow">Net balance</p>
        <h2 className="display-value">{formatPaise(totalOwedPaise - totalOwePaise)}</h2>
        <p className="hero-copy">
          {summary.peopleWhoOweCount} people still owe you.
          {summary.oldestPendingSplit
            ? ` Oldest open split: ${formatDate(summary.oldestPendingSplit.createdAt)}.`
            : ' No open split is pending right now.'}
        </p>

        <div className="metric-grid">
          <div>
            <span>Owed to you</span>
            <strong>{formatPaise(totalOwedPaise)}</strong>
          </div>
          <div>
            <span>You owe</span>
            <strong>{formatPaise(totalOwePaise)}</strong>
          </div>
          <div>
            <span>Pending flow</span>
            <strong>{formatPaise(summary.totalPendingAmountPaise)}</strong>
          </div>
          <div>
            <span>Pay-first ratio</span>
            <strong>{payFirst}%</strong>
          </div>
        </div>
      </div>

      {!hasCurrentUser && (
        <div className="glass-panel hero-panel hero-panel-empty hero-panel-visible">
          <p className="eyebrow">First run</p>
          <h2 className="display-value">Set your name.</h2>
          <p className="hero-copy">
            The sidebar profile powers every payer-based calculation. Once that is
            saved, Titan can start building balances from the real entries you add.
          </p>
          <div className="metric-grid">
            <div>
              <span>1</span>
              <strong>Save your name</strong>
            </div>
            <div>
              <span>2</span>
              <strong>Create a group or add a split</strong>
            </div>
            <div>
              <span>3</span>
              <strong>Use cash, EMI, and rent tools as needed</strong>
            </div>
            <div>
              <span>4</span>
              <strong>Watch the insights layer update from real data</strong>
            </div>
          </div>
        </div>
      )}
    </section>
  )
})