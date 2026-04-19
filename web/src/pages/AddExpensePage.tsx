import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { TitanDropdown } from '../components/TitanDropdown'
import { TitanSwitch } from '../components/TitanSwitch'
import { PageHeader } from '../components/PageHeader'
import { ReceiptScanPanel } from '../features/receipt-scan/components/ReceiptScanPanel'
import { ShareLinkButton } from '../features/share-links/components/ShareLinkButton'
import { parseShareLinkValue } from '../features/share-links/services/shareLinkService'
import { createShareLink } from '../features/share-links/services/shareLinkService'
import {
  findGroup,
  getKnownPeople,
  sanitizeParticipantList,
} from '../lib/finance'
import { parseAmountInput } from '../lib/input'
import type { TitanState } from '../types'
import { useTitanActions, useTitanState } from '../state/useTitan'

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
  const state = useTitanState()
  const { addSplit, updateSplit, deleteSplit } = useTitanActions()
  const hasCurrentUser = Boolean(state.currentUser)
  const defaultGroupId = searchParams.get('group') ?? ''
  const editSplitId = searchParams.get('edit') ?? ''
  const editSplit = state.splits.find((split) => split.id === editSplitId)
  const sharedPayload = parseShareLinkValue(searchParams.get('data'))
  const sharedDraft =
    sharedPayload && sharedPayload.type === 'expense-draft' && !editSplit
      ? sharedPayload.data
      : null
  const availableGroups = state.groups.filter(
    (group) => group.members.includes(state.currentUser) || group.id === editSplit?.groupId,
  )

  return (
    <ExpenseEditor
      key={`${editSplit?.id ?? 'new'}:${defaultGroupId}`}
      availableGroups={availableGroups}
      deleteSplit={deleteSplit}
      editSplitId={editSplit?.id}
      hasCurrentUser={hasCurrentUser}
      initialAmount={editSplit ? (editSplit.amountPaise / 100).toFixed(2) : String(sharedDraft?.amount ?? '')}
      initialDescription={editSplit ? editSplit.description : String(sharedDraft?.description ?? '')}
      initialGroupId={editSplit?.groupId ?? defaultGroupId}
      initialParticipants={editSplit?.participants.join(', ') ?? String(sharedDraft?.participants ?? '')}
      navigate={navigate}
      onSave={addSplit}
      onUpdate={updateSplit}
      sharedPayloadType={sharedPayload?.type}
      state={state}
    />
  )
}

type ExpenseEditorProps = {
  availableGroups: TitanState['groups']
  deleteSplit: (splitId: string) => void
  editSplitId?: string
  hasCurrentUser: boolean
  initialAmount: string
  initialDescription: string
  initialGroupId: string
  initialParticipants: string | undefined
  navigate: ReturnType<typeof useNavigate>
  onSave: (payload: {
    amountPaise: number
    description: string
    participants: string[]
    groupId?: string
  }) => void
  onUpdate: (payload: {
    splitId: string
    amountPaise: number
    description: string
    participants: string[]
    groupId?: string
  }) => void
  sharedPayloadType?: string
  state: TitanState
}

function ExpenseEditor({
  availableGroups,
  deleteSplit,
  editSplitId,
  hasCurrentUser,
  initialAmount,
  initialDescription,
  initialGroupId,
  initialParticipants,
  navigate,
  onSave,
  onUpdate,
  sharedPayloadType,
  state,
}: ExpenseEditorProps) {
  const [amount, setAmount] = useState(initialAmount)
  const [description, setDescription] = useState(initialDescription)
  const [groupId, setGroupId] = useState(initialGroupId)
  const [manualParticipants, setManualParticipants] = useState<string | null>(
    initialParticipants ?? null,
  )
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [formError, setFormError] = useState('')
  const [invalidField, setInvalidField] = useState<'amount' | 'participants' | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const navigateTimer = useRef<number | null>(null)

  const selectedGroupId = availableGroups.some((group) => group.id === groupId)
    ? groupId
    : ''
  const selectedGroup = findGroup(availableGroups, selectedGroupId)
  const knownPeople: string[] = selectedGroup
    ? selectedGroup.members.filter((member: string) => member !== state.currentUser)
    : getKnownPeople(state)
  const autoParticipants = getDefaultParticipants(
    selectedGroupId,
    state.currentUser,
    availableGroups,
  )
  const participants = manualParticipants ?? autoParticipants
  const expenseDraftLink = createShareLink('expense-draft', '/expense/new', {
    amount,
    description,
    participants,
    groupId: selectedGroup?.id,
  })

  function setParticipants(value: string) {
    setManualParticipants(value === autoParticipants ? null : value)
  }

  useEffect(() => {
    return () => {
      if (navigateTimer.current) {
        window.clearTimeout(navigateTimer.current)
      }
    }
  }, [])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    setInvalidField(null)

    const parsedAmount = parseAmountInput(amount)
    if (parsedAmount === null) {
      setInvalidField('amount')
      setFormError('Enter a valid amount before saving.')
      return
    }

    const amountPaise = Math.round(parsedAmount * 100)
    const MAX_AMOUNT_PAISE = 10_000_000_00
    const participantList = sanitizeParticipantList(participants.split(','), state.currentUser)
      .filter((participant) => (selectedGroup ? selectedGroup.members.includes(participant) : true))

    if (amountPaise <= 0 || amountPaise > MAX_AMOUNT_PAISE) {
      setInvalidField('amount')
      setFormError('Amount must be greater than 0 and within Titan limits.')
      return
    }

    if (participantList.length === 0) {
      setInvalidField('participants')
      setFormError('Add at least one participant to split this expense.')
      return
    }

    const payload = {
      amountPaise,
      description: description || 'Untitled expense',
      participants: participantList,
      groupId: selectedGroup?.id,
    }

    if (editSplitId) {
      onUpdate({ splitId: editSplitId, ...payload })
    } else {
      onSave(payload)
    }

    setShowSuccess(true)

    if (navigateTimer.current) {
      window.clearTimeout(navigateTimer.current)
    }
    navigateTimer.current = window.setTimeout(() => {
      if (selectedGroup) {
        navigate(`/groups/${selectedGroup.id}`)
        return
      }

      navigate('/')
    }, 180)
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="New / Expense"
        title={editSplitId ? 'Edit split expense' : 'Split a fresh expense'}
        description="Add a new shared expense with optional group targeting and quick participant suggestions."
      />

      <form className="form-panel glass-panel" onSubmit={handleSubmit}>
        {sharedPayloadType ? (
          <p className="inline-feedback inline-feedback-success" aria-live="polite">
            Shared draft loaded. Review and save.
          </p>
        ) : null}
        {!hasCurrentUser ? (
          <p className="muted-copy">
            Set your profile name at the top so Titan knows who is paying.
          </p>
        ) : null}
        <label className={`field ${invalidField === 'amount' ? 'field-invalid field-error-shake' : ''}`}>
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

        <TitanDropdown
          disabled={!hasCurrentUser}
          label="Group"
          options={[
            { value: '', label: 'No group' },
            ...availableGroups.map((group) => ({ value: group.id, label: group.name })),
          ]}
          onChange={(nextGroupId) => {
            setGroupId(nextGroupId)
            setManualParticipants(null)
          }}
          value={selectedGroupId}
        />

        <label className={`field field-wide ${invalidField === 'participants' ? 'field-invalid field-error-shake' : ''}`}>
          <span>Participants</span>
          <textarea
            disabled={!hasCurrentUser}
            onChange={(event) => setParticipants(event.target.value)}
            placeholder="Aarav, Meera, Kabir"
            rows={5}
            value={participants}
          />
        </label>

        <TitanSwitch
          checked={showSuggestions}
          disabled={!hasCurrentUser}
          label="Show participant suggestions"
          onChange={setShowSuggestions}
        />

        {showSuggestions ? (
          <div className="helper-block">
            <p className="eyebrow">Suggestions</p>
            <div className="chip-row">
              {knownPeople.map((person: string) => (
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
        ) : null}

        {formError ? <p className="inline-feedback inline-feedback-error">{formError}</p> : null}
        {showSuccess ? (
          <p className="inline-feedback inline-feedback-success success-pop" aria-live="polite">
            Expense saved.
          </p>
        ) : null}

        <div className="button-row">
          <button className="button button-secondary" onClick={() => navigate(-1)} type="button">
            Cancel
          </button>
          {editSplitId ? (
            <button
              className="button button-ghost"
              onClick={() => {
                deleteSplit(editSplitId)
                navigate('/history')
              }}
              type="button"
            >
              Delete split
            </button>
          ) : null}
          <button className="button button-primary" disabled={!hasCurrentUser} type="submit">
            {editSplitId ? 'Update split' : 'Save split'}
          </button>
        </div>

        <ShareLinkButton createLink={() => expenseDraftLink} />
      </form>

      <ReceiptScanPanel
        onApply={({ amount: scannedAmount, merchant }) => {
          if (scannedAmount) {
            setAmount(scannedAmount)
          }

          if (merchant) {
            setDescription((current) => current || merchant)
          }
        }}
      />
    </div>
  )
}
