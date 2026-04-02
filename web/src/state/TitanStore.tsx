import {
  startTransition,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react'
import { emptyState } from '../data/emptyState'
import {
  createParticipantShareMap,
  getSettledAmountPaise,
  isSplitSettled,
  normalizeParticipantSettlementMap,
  sanitizeParticipantList,
} from '../lib/finance'
import { titanDB } from '../lib/indexeddb'
import type { Group, Split, TitanState } from '../types'
import { TitanContext, type TitanContextValue } from './titan-context'

const STORAGE_KEY = 'titan-web-state-v2'

function getLocalStorage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

type AddSplitPayload = {
  amountPaise: number
  description: string
  participants: string[]
  groupId?: string
}

type Action =
  | { type: 'HYDRATE_STATE'; state: TitanState }
  | { type: 'SET_CURRENT_USER'; name: string }
  | { type: 'ADD_SPLIT'; payload: AddSplitPayload }
  | {
      type: 'SETTLE_PARTIAL'
      splitId: string
      participantId: string
      amountPaise: number
    }
  | { type: 'SETTLE_FULL'; splitId: string; participantId: string }
  | { type: 'CREATE_GROUP'; name: string; members: string[] }
  | { type: 'APPROVE_TRANSACTION'; transactionId: string }
  | { type: 'DELETE_TRANSACTION'; transactionId: string }
  | { type: 'ADD_CASH_ENTRY'; amountRupees: number; entryType: 'IN' | 'OUT' }
  | { type: 'ADD_EMI'; name: string; amountRupees: number }
  | { type: 'TRIGGER_RENT_SPLIT'; amountPaise: number; members: string[]; recurring: boolean }

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function normalizeGroup(group: Group) {
  const members = sanitizeParticipantList(group.members)

  return {
    ...group,
    members,
  }
}

function finalizeSplit(split: Split) {
  const participants = sanitizeParticipantList(split.participants, split.paidBy)
  const participantShares = createParticipantShareMap(participants, split.amountPaise)
  const participantSettlements = normalizeParticipantSettlementMap(
    participants,
    participantShares,
    split.participantSettlements,
    split.settledAmountPaise,
  )

  const normalizedSplit: Split = {
    ...split,
    participants,
    participantShares,
    participantSettlements,
  }

  return {
    ...normalizedSplit,
    settledAmountPaise: getSettledAmountPaise(normalizedSplit),
    isSettled: isSplitSettled(normalizedSplit),
  }
}

function normalizeState(state: TitanState) {
  return {
    currentUser: state.currentUser?.trim() ?? '',
    groups: Array.isArray(state.groups) ? state.groups.map(normalizeGroup) : [],
    splits: Array.isArray(state.splits) ? state.splits.map(finalizeSplit) : [],
    transactions: Array.isArray(state.transactions) ? state.transactions : [],
    cashEntries: Array.isArray(state.cashEntries) ? state.cashEntries : [],
    emis: Array.isArray(state.emis) ? state.emis : [],
  } satisfies TitanState
}

function getInitialState() {
  const storage = getLocalStorage()
  const saved = storage?.getItem(STORAGE_KEY)
  if (!saved) {
    return emptyState;
  }
  try {
    return normalizeState(JSON.parse(saved) as TitanState);
  } catch {
    return emptyState;
  }
}

function reducer(state: TitanState, action: Action): TitanState {
  switch (action.type) {
    case 'HYDRATE_STATE':
      return normalizeState(action.state)
    case 'SET_CURRENT_USER':
      return {
        ...state,
        currentUser: action.name.trim(),
      }
    case 'ADD_SPLIT': {
      if (!state.currentUser) {
        return state
      }

      const group = action.payload.groupId
        ? state.groups.find((item) => item.id === action.payload.groupId)
        : undefined

      if (action.payload.groupId && (!group || !group.members.includes(state.currentUser))) {
        return state
      }

      const participants = sanitizeParticipantList(
        action.payload.participants,
        state.currentUser,
      ).filter((participant) => (group ? group.members.includes(participant) : true))

      if (participants.length === 0) {
        return state
      }

      const timestamp = Date.now()

      return {
        ...state,
        splits: [
          finalizeSplit({
            id: createId('split'),
            amountPaise: action.payload.amountPaise,
            description: action.payload.description,
            paidBy: state.currentUser,
            participants,
            participantShares: {},
            participantSettlements: {},
            createdAt: timestamp,
            isSettled: false,
            settledAmountPaise: 0,
            updatedAt: timestamp,
            groupId: group?.id,
          }),
          ...state.splits,
        ],
      }
    }
    case 'SETTLE_PARTIAL': {
      return {
        ...state,
        splits: state.splits.map((split) => {
          if (split.id !== action.splitId) {
            return split
          }

          const participantSharePaise =
            split.participantShares[action.participantId] ?? 0

          if (participantSharePaise <= 0) {
            return split
          }

          const participantSettledPaise = Math.min(
            participantSharePaise,
            (split.participantSettlements[action.participantId] ?? 0) +
              action.amountPaise,
          )

          return finalizeSplit({
            ...split,
            participantSettlements: {
              ...split.participantSettlements,
              [action.participantId]: participantSettledPaise,
            },
            updatedAt: Date.now(),
          })
        }),
      }
    }
    case 'SETTLE_FULL': {
      return {
        ...state,
        splits: state.splits.map((split) =>
          split.id === action.splitId
            ? finalizeSplit({
                ...split,
                participantSettlements: {
                  ...split.participantSettlements,
                  [action.participantId]:
                    split.participantShares[action.participantId] ?? 0,
                },
                updatedAt: Date.now(),
              })
            : split,
        ),
      }
    }
    case 'CREATE_GROUP': {
      if (!state.currentUser) {
        return state
      }

      const cleanedMembers = [
        state.currentUser,
        ...sanitizeParticipantList(action.members).filter(
          (member) => member !== state.currentUser,
        ),
      ]

      return {
        ...state,
        groups: [
          normalizeGroup({
            id: createId('group'),
            name: action.name,
            members: cleanedMembers,
            createdAt: Date.now(),
          }),
          ...state.groups,
        ],
      }
    }
    case 'APPROVE_TRANSACTION': {
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.transactionId
            ? { ...transaction, isApproved: true }
            : transaction,
        ),
      }
    }
    case 'DELETE_TRANSACTION': {
      return {
        ...state,
        transactions: state.transactions.filter(
          (transaction) => transaction.id !== action.transactionId,
        ),
      }
    }
    case 'ADD_CASH_ENTRY': {
      return {
        ...state,
        cashEntries: [
          {
            id: createId('cash'),
            amountRupees: action.amountRupees,
            type: action.entryType,
            createdAt: Date.now(),
          },
          ...state.cashEntries,
        ],
      }
    }
    case 'ADD_EMI': {
      return {
        ...state,
        emis: [
          {
            id: createId('emi'),
            name: action.name,
            amountRupees: action.amountRupees,
            dueDate: Date.now(),
            isActive: true,
          },
          ...state.emis,
        ],
      }
    }
    case 'TRIGGER_RENT_SPLIT': {
      if (!state.currentUser) {
        return state
      }

      const members = sanitizeParticipantList(action.members, state.currentUser)

      if (members.length === 0) {
        return state
      }

      const timestamp = Date.now()
      const description = action.recurring ? 'Monthly rent cycle' : 'Rent split'

      return {
        ...state,
        splits: [
          finalizeSplit({
            id: createId('split'),
            amountPaise: action.amountPaise,
            description,
            paidBy: state.currentUser,
            participants: members,
            participantShares: {},
            participantSettlements: {},
            createdAt: timestamp,
            isSettled: false,
            settledAmountPaise: 0,
            updatedAt: timestamp,
          }),
          ...state.splits,
        ],
      }
    }
    default:
      return state
  }
}

export function TitanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState)

  useEffect(() => {
    let active = true

    titanDB
      .loadState()
      .then((persistedState) => {
        if (!active || !persistedState) {
          return
        }
        startTransition(() => {
          dispatch({ type: 'HYDRATE_STATE', state: persistedState })
        })
      })
      .catch((err) => {
        console.warn('Failed to hydrate state from IndexedDB:', err)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    // Save to both localStorage (fallback) and IndexedDB (primary)
    const storage = getLocalStorage()
    storage?.setItem(STORAGE_KEY, JSON.stringify(state))

    let canceled = false

    const persistState = async () => {
      try {
        await titanDB.saveState(state)
      } catch (err) {
        console.warn('Failed to save state to IndexedDB. Retrying once:', err)
        await new Promise((resolve) => setTimeout(resolve, 500))
        if (canceled) {
          return
        }

        try {
          await titanDB.saveState(state)
        } catch (retryErr) {
          console.warn('Second IndexedDB save attempt failed:', retryErr)
        }
      }
    }

    void persistState()

    return () => {
      canceled = true
    }
  }, [state])

  const value: TitanContextValue = {
    state,
    setCurrentUser(name) {
      startTransition(() => {
        dispatch({ type: 'SET_CURRENT_USER', name })
      })
    },
    addSplit(payload) {
      startTransition(() => {
        dispatch({ type: 'ADD_SPLIT', payload })
      })
    },
    settlePartial(splitId, participantId, amountPaise) {
      startTransition(() => {
        dispatch({ type: 'SETTLE_PARTIAL', splitId, participantId, amountPaise })
      })
    },
    settleFull(splitId, participantId) {
      startTransition(() => {
        dispatch({ type: 'SETTLE_FULL', splitId, participantId })
      })
    },
    createGroup(name, members) {
      startTransition(() => {
        dispatch({ type: 'CREATE_GROUP', name, members })
      })
    },
    approveTransaction(transactionId) {
      startTransition(() => {
        dispatch({ type: 'APPROVE_TRANSACTION', transactionId })
      })
    },
    deleteTransaction(transactionId) {
      startTransition(() => {
        dispatch({ type: 'DELETE_TRANSACTION', transactionId })
      })
    },
    addCashEntry(amountRupees, entryType) {
      startTransition(() => {
        dispatch({ type: 'ADD_CASH_ENTRY', amountRupees, entryType })
      })
    },
    addEmi(name, amountRupees) {
      startTransition(() => {
        dispatch({ type: 'ADD_EMI', name, amountRupees })
      })
    },
    triggerRentSplit(amountPaise, members, recurring) {
      startTransition(() => {
        dispatch({ type: 'TRIGGER_RENT_SPLIT', amountPaise, members, recurring })
      })
    },
  }

  return <TitanContext.Provider value={value}>{children}</TitanContext.Provider>
}
