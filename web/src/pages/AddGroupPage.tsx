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
  const [formError, setFormError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  return (
    <div className="page">
      <PageHeader
        eyebrow="New / Group"
        title={editGroup ? 'Edit shared group' : 'Create a shared group'}
        description="Set up a group quickly with a name and members, then jump straight to settlements."
      />

      <form
        className="glass-panel form-panel"
        onSubmit={(event) => {
          event.preventDefault()
          setFormError('')

          const memberList = members
            .split(',')
            .map((member) => member.trim())
            .filter(Boolean)

          if (!name.trim()) {
            setFormError('Enter a group name before continuing.')
            return
          }

          if (editGroup) {
            updateGroup({ groupId: editGroup.id, name: name.trim(), members: memberList })
          } else {
            createGroup(name.trim(), memberList)
          }
          setShowSuccess(true)
          navigate('/groups')
        }}
      >
        {!hasCurrentUser ? (
          <p className="muted-copy">
            Set your profile name at the top so Titan can add you to the group.
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

        {formError ? <p className="inline-feedback inline-feedback-error">{formError}</p> : null}
        {showSuccess ? (
          <p className="inline-feedback inline-feedback-success success-pop" aria-live="polite">
            Group saved.
          </p>
        ) : null}

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
