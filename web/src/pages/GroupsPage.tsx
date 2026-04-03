import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useTitanState } from '../state/useTitan'

export function GroupsPage() {
  const navigate = useNavigate()
  const state = useTitanState()

  return (
    <div className="page">
      <PageHeader
        eyebrow="Financial / Groups"
        title="Shared circles"
        description="Manage shared expense groups and settle balances with a clear payment roadmap."
        action={
          <button
            className="button button-primary"
            onClick={() => navigate('/groups/new')}
            type="button"
            aria-label="Create new group"
          >
            New group
          </button>
        }
      />

      <div className="glass-panel" aria-busy="false" aria-live="polite">
        {state.groups.length === 0 ? (
          <p className="muted-copy">No groups yet.</p>
        ) : (
          <ul className="group-list">
            {state.groups.map((group) => (
              <li key={group.id} className="group-list-item">
                <Link className="inline-link" to={`/groups/${group.id}`}>
                  <span className="group-name">{group.name}</span>
                </Link>
                <span className="group-members">{group.members.join(', ')}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
