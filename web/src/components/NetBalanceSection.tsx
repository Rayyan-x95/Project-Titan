import { memo, useMemo } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
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
  const shouldReduceMotion = useReducedMotion()
  const hasCurrentUser = Boolean(state.currentUser)
  const hasWorkspaceData = state.groups.length > 0 || state.splits.length > 0
  
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

  if (!hasCurrentUser && !hasWorkspaceData) {
    return (
      <section className="hero-grid onboarding-grid">
        <article className="glass-panel hero-panel onboarding-welcome-panel">
          <div className="onboarding-brand-pill" aria-label="Titan branding">
            <img src="/titan_logo_icon_transparent.png" alt="Titan logo" />
            <span>Titan</span>
          </div>
          <p className="eyebrow">Welcome back</p>
          <h1 className="display-value onboarding-title">Split expenses, stay friends.</h1>
        </article>

        <article className="glass-panel hero-panel hero-panel-empty onboarding-empty-panel">
          <div className="onboarding-illustration" aria-hidden="true">
            <img src="/titan_logo_icon_transparent.png" alt="" />
          </div>
          <h3>No events yet</h3>
          <p className="hero-copy">
            Set up your profile, then create an event to start splitting expenses with friends.
          </p>
          <div className="button-row">
            <Link className="button button-secondary onboarding-cta" to="/profile">
              Set up profile
            </Link>
            <Link className="button button-primary onboarding-cta" to="/groups/new">
              Create first event
            </Link>
          </div>
        </article>
      </section>
    )
  }

  return (
    <section className="hero-grid">
      <div className={`glass-panel hero-panel ${hasCurrentUser ? 'hero-panel-visible' : 'hero-panel-hidden'}`}>
        <p className="eyebrow">Net balance</p>
        <m.h2
          key={totalOwedPaise - totalOwePaise}
          className="display-value"
          initial={shouldReduceMotion ? false : { opacity: 0.6, y: 8 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {formatPaise(totalOwedPaise - totalOwePaise)}
        </m.h2>
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
            Your profile name powers every payer-based calculation. Once that is
            saved, Titan can start building balances from the real entries you add.
          </p>
          <Link className="inline-link" to="/profile">
            Open profile setup
          </Link>
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
