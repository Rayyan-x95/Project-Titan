import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useTitan } from '../state/useTitan'

export function AddGroupPage() {
  const navigate = useNavigate()
  const { state, createGroup } = useTitan()
  const hasCurrentUser = Boolean(state.currentUser)
  const [name, setName] = useState('')
  const [members, setMembers] = useState('')

  return (
    <div className="page">
      <PageHeader
        eyebrow="New / Group"
        title="Create a shared group"
        description="Group setup is kept deliberately light: one name, a comma-separated member list, and immediate access to the settlement roadmap."
      />

      <form
        className="glass-panel form-panel"
        onSubmit={(event) => {
          event.preventDefault()

          const memberList = members
            .split(',')
            .map((member) => member.trim())
            .filter(Boolean)

          if (!name.trim()) {
            return
          }

          createGroup(name.trim(), memberList)
          navigate('/groups')
        }}
      >
        {!hasCurrentUser ? (
          <p className="muted-copy">
            Save your name in the sidebar first so Titan can add you to the group.
          </p>
        ) : null}
        <label className="field">
          <span>Group name</span>
          <input
            disabled={!hasCurrentUser}
            onChange={(event) => setName(event.target.value)}
            placeholder="Vault House"
            value={name}
          />
        </label>

        <label className="field field-wide">
          <span>Members</span>
          <textarea
            disabled={!hasCurrentUser}
            onChange={(event) => setMembers(event.target.value)}
            placeholder="Aarav, Meera, Kabir"
            rows={4}
            value={members}
          />
        </label>

        <div className="button-row">
          <button className="button button-secondary" onClick={() => navigate(-1)} type="button">
            Cancel
          </button>
          <button className="button button-primary" disabled={!hasCurrentUser} type="submit">
            Create group
          </button>
        </div>
      </form>
    </div>
  )
}
