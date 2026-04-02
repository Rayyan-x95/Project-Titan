import { memo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import {
  findGroup,
  formatDate,
  formatPaise,
  getAlwaysPaysFirstPercentage,
  getHealthScore,
  getKnownPeople,
  getPersonBalances,
  getSpendTrends,
  getSummaryInsights,
  getTotalOwePaise,
  getTotalOwedPaise,
  mapReverseInsight,
} from '../lib/finance'
import { useTitan } from '../state/useTitan'

export default memo(function HomePage() {
  const { state } = useTitan()
  const hasCurrentUser = Boolean(state.currentUser)
  const hasActivity =
    state.splits.length > 0 ||
    state.groups.length > 0 ||
    state.transactions.length > 0 ||
    state.cashEntries.length > 0 ||
    state.emis.length > 0
  const balances = getPersonBalances(state.splits, state.currentUser)
  const summary = getSummaryInsights(state.splits, state.currentUser)
  const totalOwedPaise = getTotalOwedPaise(balances)
  const totalOwePaise = getTotalOwePaise(balances)
  const health = getHealthScore(state.emis, state.splits)
  const trends = getSpendTrends(state.splits, state.cashEntries, state.transactions)
  const reverseInsight = mapReverseInsight(trends[0]?.totalRupees ?? 0)
  const payFirst = getAlwaysPaysFirstPercentage(state.splits, state.currentUser)
  const knownPeople = getKnownPeople(state).slice(0, 6)

  return (
    <div className="page">
      <PageHeader
        eyebrow="Titan / Vault"
        title={hasCurrentUser ? 'Split command center' : 'Start your vault'}
        description={
          hasCurrentUser
            ? 'A web port of the Kotlin finance app, tuned for quick shared-expense work, India-specific tools, and ambient insight instead of Android chrome.'
            : 'Set your profile once, then use Titan as a clean web workspace for shared expenses, rent cycles, cash tracking, and EMI pressure.'
        }
        action={
          hasCurrentUser ? (
            <Link className="button button-primary" to="/expense/new">
              Add expense
            </Link>
          ) : (
            <button className="button button-secondary" disabled type="button">
              Set your name first
            </button>
          )
        }
      />

      {!hasCurrentUser ? (
        <section className="hero-grid">
          <motion.article
            className="glass-panel hero-panel hero-panel-empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
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
          </motion.article>

          <div className="stack-column">
            <article className="glass-panel compact-panel">
              <p className="eyebrow">Workspace</p>
              <strong>Built for operations</strong>
              <p>Split ledger, group settlements, cash flow, EMI load, and rent cycles.</p>
            </article>

            <article className="glass-panel compact-panel">
              <p className="eyebrow">Design</p>
              <strong>Neon editorial shell</strong>
              <p>Responsive glass surfaces, reduced chrome, and a mobile-first content flow.</p>
            </article>
          </div>
        </section>
      ) : (
        <section className="hero-grid">
          <motion.article
            className="glass-panel hero-panel"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <p className="eyebrow">Net balance</p>
            <h2 className="display-value">{formatPaise(totalOwedPaise - totalOwePaise)}</h2>
            <p className="hero-copy">
              {summary.peopleWhoOweCount} people still owe you. Your oldest open split
              started {summary.oldestPendingSplit ? formatDate(summary.oldestPendingSplit.createdAt) : 'recently'}.
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
          </motion.article>

          <div className="stack-column">
            <article className="glass-panel compact-panel">
              <p className="eyebrow">Health score</p>
              <div className="inline-split">
                <strong className={`status-${health.status.toLowerCase()}`}>{health.score}%</strong>
                <span>{health.status}</span>
              </div>
              <p>{health.recommendation}</p>
              <Link className="inline-link" to="/insights/health">
                Open full diagnosis
              </Link>
            </article>

            <article className="glass-panel compact-panel">
              <p className="eyebrow">Relativity</p>
              <strong>{formatPaise(Math.round(reverseInsight.amountRupees * 100))}</strong>
              <p>This week feels like {reverseInsight.valueInContext}.</p>
              <Link className="inline-link" to="/insights">
                See insights hub
              </Link>
            </article>
          </div>
        </section>
      )}

      <section className="feature-grid">
        <Link className="feature-tile" to="/sms">
          <span>SMS</span>
          <strong>Review detected alerts</strong>
        </Link>
        <Link className="feature-tile" to="/cash">
          <span>Cash</span>
          <strong>Track in-hand flow</strong>
        </Link>
        <Link className="feature-tile" to="/emis">
          <span>EMI</span>
          <strong>Watch monthly load</strong>
        </Link>
        <Link className="feature-tile" to="/rent">
          <span>Rent</span>
          <strong>Trigger monthly cycles</strong>
        </Link>
        <Link className="feature-tile" to="/groups">
          <span>Groups</span>
          <strong>Balance shared spaces</strong>
        </Link>
      </section>

      <section className="content-grid">
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

        <article className="glass-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Groups</p>
              <h3>Settlement roadmaps</h3>
            </div>
            <Link className="inline-link" to="/groups">
              Manage groups
            </Link>
          </div>

          <div className="list-block">
            {state.groups.map((group) => (
              <Link key={group.id} className="list-row" to={`/groups/${group.id}`}>
                <div>
                  <strong>{group.name}</strong>
                  <span>{group.members.length} members in this circle</span>
                </div>
                <strong>{findGroup(state.groups, group.id)?.members.length}</strong>
              </Link>
            ))}
            {state.groups.length === 0 ? (
              <p className="muted-copy">
                {hasActivity
                  ? 'No groups yet. Create one to start tracking shared circles.'
                  : 'Create a group once you are ready to track a shared house, trip, or project.'}
              </p>
            ) : null}
          </div>

          <div className="known-people">
            <p className="eyebrow">Known people</p>
            <div className="chip-row">
              {knownPeople.map((person) => (
                <span key={person} className="chip">
                  {person}
                </span>
              ))}
              {knownPeople.length === 0 ? (
                <p className="muted-copy">People will appear here after you add splits or groups.</p>
              ) : null}
            </div>
          </div>
        </article>
      </section>
    </div>
  )
})