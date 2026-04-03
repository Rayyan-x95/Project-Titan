import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useTitanActions, useTitanState } from '../state/useTitan'

export function AddGroupPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const state = useTitanState()
  const { createGroup, updateGroup } = useTitanActions()
  const editGroupId = searchParams.get('edit') ?? ''
  const editGroup = state.groups.find((group) => group.id === editGroupId)
  return (
    <GroupEditor
      key={editGroup?.id ?? 'new'}
      createGroup={createGroup}
      currentUser={state.currentUser}
      editGroup={editGroup}
      navigate={navigate}
      updateGroup={updateGroup}
    />
  )
}

type GroupEditorProps = {
  createGroup: (name: string, members: string[]) => void
  currentUser: string
  editGroup?: NonNullable<ReturnType<typeof useTitanState>['groups'][number]>
  navigate: ReturnType<typeof useNavigate>
  updateGroup: (payload: { groupId: string; name: string; members: string[] }) => void
}

function GroupEditor({ createGroup, currentUser, editGroup, navigate, updateGroup }: GroupEditorProps) {
  const [name, setName] = useState(editGroup?.name ?? '')
  const [members, setMembers] = useState(
    editGroup?.members.filter((member) => member !== currentUser).join(', ') ?? '',
  )
  const hasCurrentUser = Boolean(currentUser)

  return (
    <div className="page">
      <PageHeader
        eyebrow="New / Group"
        title={editGroup ? 'Edit shared group' : 'Create a shared group'}
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

          if (editGroup) {
            updateGroup({ groupId: editGroup.id, name: name.trim(), members: memberList })
          } else {
            createGroup(name.trim(), memberList)
          }
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
            {editGroup ? 'Update group' : 'Create group'}
          </button>
        </div>
      </form>
    </div>
  )
}
