import { memo } from 'react'
import { Link } from 'react-router-dom'
import type { TitanState } from '../types'

export const GroupsSection = memo(({ state, hasActivity }: { 
  state: TitanState, 
  hasActivity: boolean 
}) => {
  return (
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
            <strong>{group.members.length}</strong>
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
    </article>
  )
})