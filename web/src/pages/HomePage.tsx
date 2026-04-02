import { FeatureGrid } from '../components/FeatureGrid'
import { GroupsSection } from '../components/GroupsSection'
import { HealthInsightsSection } from '../components/HealthInsightsSection'
import { NetBalanceSection } from '../components/NetBalanceSection'
import { PeopleSection } from '../components/PeopleSection'
import { formatDate } from '../lib/finance'
import { useTitan } from '../state/useTitan'

export default function HomePage() {
  const { state } = useTitan()
  const recentNotifications = state.notifications.slice(0, 3)

  return (
    <div className="page home-page">
      <section className="page-hero-stack">
        <NetBalanceSection state={state} />
      </section>

      <section className="feature-grid-panel glass-panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Shortcuts</p>
            <h3>Feature lock</h3>
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
            <p className="muted-copy">Actions you take in Titan will show up here.</p>
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
