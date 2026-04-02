import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import {
  findGroup,
  getKnownPeople,
  sanitizeParticipantList,
} from '../lib/finance'
import type { TitanState } from '../types'
import { useTitan } from '../state/useTitan'

function getDefaultParticipants(
  groupId: string,
  currentUser: string,
  groups: TitanState['groups'],
) {
  const selectedGroup = findGroup(groups, groupId)

  if (!selectedGroup) {
    return ''
  }

  return selectedGroup.members
    .filter((member) => member !== currentUser)
    .join(', ')
}

export function AddExpensePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { state, addSplit, updateSplit, deleteSplit } = useTitan()
  const hasCurrentUser = Boolean(state.currentUser)
  const defaultGroupId = searchParams.get('group') ?? ''
  const editSplitId = searchParams.get('edit') ?? ''
  const editSplit = state.splits.find((split) => split.id === editSplitId)
  const availableGroups = state.groups.filter(
    (group) => group.members.includes(state.currentUser) || group.id === editSplit?.groupId,
  )

  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [groupId, setGroupId] = useState(defaultGroupId)
  const [manualParticipants, setManualParticipants] = useState<string | null>(null)
  const selectedGroupId = availableGroups.some((group) => group.id === groupId)
    ? groupId
    : ''
  const selectedGroup = findGroup(availableGroups, selectedGroupId)
  const knownPeople = selectedGroup
    ? selectedGroup.members.filter((member) => member !== state.currentUser)
    : getKnownPeople(state)
  const autoParticipants = getDefaultParticipants(
    selectedGroupId,
    state.currentUser,
    availableGroups,
  )
  const participants = manualParticipants ?? autoParticipants

  useEffect(() => {
    if (!editSplit) {
      return
    }

    setAmount((editSplit.amountPaise / 100).toFixed(2))
    setDescription(editSplit.description)
    setGroupId(editSplit.groupId ?? '')
    setManualParticipants(editSplit.participants.join(', '))
  }, [editSplit])

  function setParticipants(value: string) {
    setManualParticipants(value === autoParticipants ? null : value)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedAmount = Number(amount)
    if (!Number.isFinite(parsedAmount)) {
      return
    }

    const amountPaise = Math.round(parsedAmount * 100)
    const MAX_AMOUNT_PAISE = 10_000_000_00
    const participantList = sanitizeParticipantList(participants.split(','), state.currentUser)
      .filter((participant) => (selectedGroup ? selectedGroup.members.includes(participant) : true))

    if (amountPaise <= 0 || amountPaise > MAX_AMOUNT_PAISE || participantList.length === 0) {
      return
    }

    const payload = {
      amountPaise,
      description: description || 'Untitled expense',
      participants: participantList,
      groupId: selectedGroup?.id,
    }

    if (editSplit) {
      updateSplit({ splitId: editSplit.id, ...payload })
    } else {
      addSplit(payload)
    }

    if (selectedGroup) {
      navigate(`/groups/${selectedGroup.id}`)
      return
    }

    navigate('/')
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="New / Expense"
        title={editSplit ? 'Edit split expense' : 'Split a fresh expense'}
        description="This ports the Android add-expense flow into a web form, with optional group targeting and a faster text-based participant list."
      />

      <form className="form-panel glass-panel" onSubmit={handleSubmit}>
        {!hasCurrentUser ? (
          <p className="muted-copy">
            Save your name in the sidebar first so Titan knows who is paying.
          </p>
        ) : null}
        <label className="field">
          <span>Amount</span>
          <input
            disabled={!hasCurrentUser}
            inputMode="decimal"
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0"
            value={amount}
          />
        </label>

        <label className="field">
          <span>Description</span>
          <input
            disabled={!hasCurrentUser}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Friday dinner"
            value={description}
          />
        </label>

        <label className="field">
          <span>Group</span>
          <select
            disabled={!hasCurrentUser}
            onChange={(event) => {
              const nextGroupId = event.target.value
              setGroupId(nextGroupId)
              setManualParticipants(null)
            }}
            value={selectedGroupId}
          >
            <option value="">No group</option>
            {availableGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field field-wide">
          <span>Participants</span>
          <textarea
            disabled={!hasCurrentUser}
            onChange={(event) => setParticipants(event.target.value)}
            placeholder="Aarav, Meera, Kabir"
            rows={5}
            value={participants}
          />
        </label>

        <div className="helper-block">
          <p className="eyebrow">Suggestions</p>
          <div className="chip-row">
            {knownPeople.map((person) => (
              <button
                key={person}
                className="chip chip-button"
                disabled={!hasCurrentUser}
                onClick={() => {
                  const current = sanitizeParticipantList(
                    participants.split(','),
                    state.currentUser,
                  )

                  if (!current.includes(person)) {
                    setParticipants([...current, person].join(', '))
                  }
                }}
                type="button"
              >
                {person}
              </button>
            ))}
          </div>
        </div>

        <div className="button-row">
          <button className="button button-secondary" onClick={() => navigate(-1)} type="button">
            Cancel
          </button>
          {editSplit ? (
            <button
              className="button button-ghost"
              onClick={() => {
                deleteSplit(editSplit.id)
                navigate('/history')
              }}
              type="button"
            >
              Delete split
            </button>
          ) : null}
          <button className="button button-primary" disabled={!hasCurrentUser} type="submit">
            {editSplit ? 'Update split' : 'Save split'}
          </button>
        </div>
      </form>
    </div>
  )
}
