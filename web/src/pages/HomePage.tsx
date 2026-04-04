import { FeatureGrid } from '../components/FeatureGrid'
import { GroupsSection } from '../components/GroupsSection'
import { HealthInsightsSection } from '../components/HealthInsightsSection'
import { NetBalanceSection } from '../components/NetBalanceSection'
import { PeopleSection } from '../components/PeopleSection'
import { formatDate } from '../lib/finance'
import { useTitanState } from '../state/useTitan'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const state = useTitanState()
  const recentNotifications = state.notifications.slice(0, 2)

  return (
    <div className="page home-page">
      <section className="page-hero-stack">
        <NetBalanceSection state={state} />
      </section>

      <section className="glass-panel compact-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Start</p>
            <h3>What do you want to do now?</h3>
          </div>
        </div>
        <div className="button-row">
          <Link className="button button-primary" to="/expense/new">
            Add expense
          </Link>
          <Link className="button button-secondary" to="/groups/new">
            Create group
          </Link>
        </div>
      </section>

      <section className="feature-grid-panel glass-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Tools</p>
            <h3>Quick actions</h3>
          </div>
        </div>
        <div className="feature-grid">
          <FeatureGrid />
        </div>
      </section>

      <section className="content-grid">
        <PeopleSection state={state} hasActivity={state.splits.length > 0 || state.transactions.length > 0} />
        <GroupsSection state={state} hasActivity={state.splits.length > 0 || state.transactions.length > 0} />
      </section>

      <HealthInsightsSection state={state} />

      <section className="glass-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Notifications</p>
            <h3>Local activity feed</h3>
          </div>
        </div>

        <div className="list-block">
          {recentNotifications.length === 0 ? (
            <p className="muted-copy">Start by adding an expense or creating a group to see activity here.</p>
          ) : (
            recentNotifications.map((note) => (
              <article key={note.id} className={`list-row list-row-static note-${note.kind}`}>
                <div>
                  <strong>{note.title}</strong>
                  <span>
                    {note.message} · {formatDate(note.createdAt)}
                  </span>
                </div>
                {note.href ? (
                  <a className="inline-link" href={note.href}>
                    Open
                  </a>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
