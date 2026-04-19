import {
  startTransition,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import { emptyState } from '../data/emptyState'
import {
  createParticipantShareMap,
  getBudgetSummary,
  getCurrentMonthTrackedSpendRupees,
  getSettledAmountPaise,
  isSplitSettled,
  normalizeParticipantSettlementMap,
  sanitizeParticipantList,
} from '../lib/finance'
import { titanBackend } from '../services/titan-backend'
import type {
  Group,
  NotificationEntry,
  RentSchedule,
  Split,
  TitanState,
} from '../types'
import {
  type AddSplitInput,
  TitanActionsContext,
  TitanCurrentUserContext,
  TitanStateContext,
  type TitanActions,
} from './titan-context'
import { enqueueOfflineOperation } from '../features/offline-sync/services/offlineQueue'

const RENT_INTERVAL_DAYS = 30

type Action =
  | { type: 'HYDRATE_STATE'; state: TitanState }
  | { type: 'SET_CURRENT_USER'; name: string }
  | { type: 'UPDATE_PROFILE'; savingsGoalRupees: number }
  | {
      type: 'UPDATE_BUDGET'
      monthlyLimitRupees: number
      warningThresholdPercent: number
    }
  | { type: 'SET_BUDGET_ALERT_KEY'; alertKey?: string }
  | { type: 'ADD_SPLIT'; payload: AddSplitInput }
  | { type: 'UPDATE_SPLIT'; splitId: string; payload: AddSplitInput }
  | { type: 'DELETE_SPLIT'; splitId: string }
  | {
      type: 'SETTLE_PARTIAL'
      splitId: string
      participantId: string
      amountPaise: number
    }
  | { type: 'SETTLE_FULL'; splitId: string; participantId: string }
  | { type: 'CREATE_GROUP'; name: string; members: string[] }
  | { type: 'UPDATE_GROUP'; groupId: string; name: string; members: string[] }
  | { type: 'DELETE_GROUP'; groupId: string }
  | { type: 'APPROVE_TRANSACTION'; transactionId: string }
  | { type: 'DELETE_TRANSACTION'; transactionId: string }
  | { type: 'INGEST_TRANSACTION'; merchant: string; amountRupees: number; entryType?: string }
  | { type: 'ADD_CASH_ENTRY'; amountRupees: number; entryType: 'IN' | 'OUT' }
  | { type: 'ADD_EMI'; name: string; amountRupees: number }
  | { type: 'UPDATE_EMI'; emiId: string; name: string; amountRupees: number }
  | { type: 'DELETE_EMI'; emiId: string }
  | { type: 'TRIGGER_RENT_SPLIT'; amountPaise: number; members: string[]; recurring: boolean }
  | { type: 'RUN_DUE_RENT_SCHEDULES' }
  | {
      type: 'ADD_NOTIFICATION'
      title: string
      message: string
      kind: NotificationEntry['kind']
      href?: string
    }
  | { type: 'DISMISS_NOTIFICATION'; id: string }
  | { type: 'MARK_NOTIFICATION_READ'; id: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'CLEAR_NOTIFICATIONS'; readOnly?: boolean }

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function createNotification(
  title: string,
  message: string,
  kind: NotificationEntry['kind'] = 'info',
  href?: string,
): NotificationEntry {
  return {
    id: createId('note'),
    title,
    message,
    kind,
    href,
    createdAt: Date.now(),
    read: false,
  }
}

function pushNotification(state: TitanState, notification: NotificationEntry) {
  return {
    ...state,
    notifications: [notification, ...state.notifications].slice(0, 20),
  }
}

function normalizeGroup(group: Group): Group {
  return {
    ...group,
    members: sanitizeParticipantList(group.members),
    updatedAt: group.updatedAt ?? group.createdAt,
  }
}

function normalizeRentSchedule(schedule: RentSchedule): RentSchedule {
  return {
    ...schedule,
    members: sanitizeParticipantList(schedule.members, schedule.paidBy),
    intervalDays: Math.max(schedule.intervalDays || RENT_INTERVAL_DAYS, 1),
    nextRunAt: Math.max(schedule.nextRunAt, schedule.createdAt),
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

function normalizeState(state: TitanState): TitanState {
  return {
    currentUser: state.currentUser?.trim() ?? '',
    groups: Array.isArray(state.groups) ? state.groups.map(normalizeGroup) : [],
    splits: Array.isArray(state.splits) ? state.splits.map(finalizeSplit) : [],
    transactions: Array.isArray(state.transactions) ? state.transactions : [],
    cashEntries: Array.isArray(state.cashEntries) ? state.cashEntries : [],
    emis: Array.isArray(state.emis)
      ? state.emis.map((emi) => ({ ...emi, updatedAt: emi.updatedAt ?? emi.dueDate }))
      : [],
    notifications: Array.isArray(state.notifications) ? state.notifications : [],
    profile: {
      savingsGoalRupees: Math.max(state.profile?.savingsGoalRupees ?? 0, 0),
    },
    budget: {
      monthlyLimitRupees: Math.max(state.budget?.monthlyLimitRupees ?? 0, 0),
      warningThresholdPercent: Math.min(
        Math.max(Math.round(state.budget?.warningThresholdPercent ?? 80), 1),
        100,
      ),
      lastAlertKey: state.budget?.lastAlertKey,
    },
    rentSchedules: Array.isArray(state.rentSchedules)
      ? state.rentSchedules.map(normalizeRentSchedule)
      : [],
  }
}

function getInitialState() {
  return emptyState
}

function buildSplitFromPayload(
  state: TitanState,
  payload: AddSplitInput,
  existingSplit?: Split,
) {
  if (!state.currentUser) {
    return null
  }

  const group = payload.groupId
    ? state.groups.find((item) => item.id === payload.groupId)
    : undefined

  if (payload.groupId && (!group || !group.members.includes(state.currentUser))) {
    return null
  }

  const participants = sanitizeParticipantList(payload.participants, state.currentUser)
    .filter((participant) => (group ? group.members.includes(participant) : true))

  if (participants.length === 0) {
    return null
  }

  const timestamp = Date.now()
  return finalizeSplit({
    id: existingSplit?.id ?? createId('split'),
    amountPaise: payload.amountPaise,
    description: payload.description,
    paidBy: existingSplit?.paidBy ?? state.currentUser,
    participants,
    participantShares: {},
    participantSettlements: {},
    createdAt: existingSplit?.createdAt ?? timestamp,
    isSettled: false,
    settledAmountPaise: 0,
    updatedAt: timestamp,
    groupId: group?.id,
  })
}

function buildRentSplit(schedule: RentSchedule) {
  const participants = sanitizeParticipantList(schedule.members, schedule.paidBy)

  if (participants.length === 0) {
    return null
  }

  const timestamp = Date.now()
  return finalizeSplit({
    id: createId('split'),
    amountPaise: schedule.amountPaise,
    description: schedule.description,
    paidBy: schedule.paidBy,
    participants,
    participantShares: {},
    participantSettlements: {},
    createdAt: timestamp,
    isSettled: false,
    settledAmountPaise: 0,
    updatedAt: timestamp,
  })
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
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: {
          ...state.profile,
          savingsGoalRupees: Math.max(action.savingsGoalRupees, 0),
        },
      }
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budget: {
          ...state.budget,
          monthlyLimitRupees: Math.max(action.monthlyLimitRupees, 0),
          warningThresholdPercent: Math.min(
            Math.max(Math.round(action.warningThresholdPercent), 1),
            100,
          ),
        },
      }
    case 'SET_BUDGET_ALERT_KEY':
      return {
        ...state,
        budget: {
          ...state.budget,
          lastAlertKey: action.alertKey,
        },
      }
    case 'ADD_NOTIFICATION':
      return pushNotification(
        state,
        createNotification(action.title, action.message, action.kind, action.href),
      )
    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((notification) => notification.id !== action.id),
      }
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((notification) =>
          notification.id === action.id ? { ...notification, read: true } : notification,
        ),
      }
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map((notification) => ({
          ...notification,
          read: true,
        })),
      }
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.readOnly
          ? state.notifications.filter((notification) => !notification.read)
          : [],
      }
    case 'ADD_SPLIT': {
      const split = buildSplitFromPayload(state, action.payload)

      if (!split) {
        return state
      }

      return pushNotification(
        {
          ...state,
          splits: [split, ...state.splits],
        },
        createNotification(
          'Expense split added',
          `${split.description} was split across ${split.participants.length} people.`,
          'success',
          '/history',
        ),
      )
    }
    case 'UPDATE_SPLIT': {
      const existingSplit = state.splits.find((split) => split.id === action.splitId)

      if (!existingSplit) {
        return state
      }

      const updatedSplit = buildSplitFromPayload(state, action.payload, existingSplit)

      if (!updatedSplit) {
        return state
      }

      return pushNotification(
        {
          ...state,
          splits: state.splits.map((split) => (split.id === action.splitId ? updatedSplit : split)),
        },
        createNotification('Expense split updated', `${updatedSplit.description} was refreshed.`, 'info', '/history'),
      )
    }
    case 'DELETE_SPLIT': {
      const existingSplit = state.splits.find((split) => split.id === action.splitId)

      if (!existingSplit) {
        return state
      }

      return pushNotification(
        {
          ...state,
          splits: state.splits.filter((split) => split.id !== action.splitId),
        },
        createNotification(
          'Expense split removed',
          `${existingSplit.description} was deleted from the ledger.`,
          'warning',
          '/history',
        ),
      )
    }
    case 'SETTLE_PARTIAL': {
      return {
        ...state,
        splits: state.splits.map((split) => {
          if (split.id !== action.splitId) {
            return split
          }

          const participantSharePaise = split.participantShares[action.participantId] ?? 0

          if (participantSharePaise <= 0) {
            return split
          }

          const participantSettledPaise = Math.min(
            participantSharePaise,
            (split.participantSettlements[action.participantId] ?? 0) + action.amountPaise,
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
                  [action.participantId]: split.participantShares[action.participantId] ?? 0,
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

      const group: Group = {
        id: createId('group'),
        name: action.name,
        members: sanitizeParticipantList([state.currentUser, ...action.members], state.currentUser),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      return pushNotification(
        {
          ...state,
          groups: [normalizeGroup(group), ...state.groups],
        },
        createNotification('Group created', `${group.name} is ready for shared expenses.`, 'success', '/groups'),
      )
    }
    case 'UPDATE_GROUP': {
      const existingGroup = state.groups.find((group) => group.id === action.groupId)

      if (!existingGroup) {
        return state
      }

      const nextGroup = normalizeGroup({
        ...existingGroup,
        name: action.name,
        members: sanitizeParticipantList([state.currentUser, ...action.members], state.currentUser),
        updatedAt: Date.now(),
      })

      return pushNotification(
        {
          ...state,
          groups: state.groups.map((group) => (group.id === action.groupId ? nextGroup : group)),
        },
        createNotification('Group updated', `${nextGroup.name} was refreshed.`, 'info', `/groups/${nextGroup.id}`),
      )
    }
    case 'DELETE_GROUP': {
      const existingGroup = state.groups.find((group) => group.id === action.groupId)

      if (!existingGroup) {
        return state
      }

      return pushNotification(
        {
          ...state,
          groups: state.groups.filter((group) => group.id !== action.groupId),
          splits: state.splits.map((split) =>
            split.groupId === action.groupId
              ? finalizeSplit({ ...split, groupId: undefined, updatedAt: Date.now() })
              : split,
          ),
        },
        createNotification(
          'Group deleted',
          `${existingGroup.name} was removed and linked expenses were detached.`,
          'warning',
          '/groups',
        ),
      )
    }
    case 'APPROVE_TRANSACTION': {
      return pushNotification(
        {
          ...state,
          transactions: state.transactions.map((transaction) =>
            transaction.id === action.transactionId
              ? { ...transaction, isApproved: true }
              : transaction,
          ),
        },
        createNotification('Transaction approved', 'The alert has been cleared.', 'success', '/sms'),
      )
    }
    case 'DELETE_TRANSACTION': {
      const existingTransaction = state.transactions.find((item) => item.id === action.transactionId)

      if (!existingTransaction) {
        return state
      }

      return pushNotification(
        {
          ...state,
          transactions: state.transactions.filter((item) => item.id !== action.transactionId),
        },
        createNotification('Transaction removed', `${existingTransaction.merchant} was ignored.`, 'warning', '/sms'),
      )
    }
    case 'INGEST_TRANSACTION': {
      const transaction = {
        id: createId('tx'),
        merchant: action.merchant.trim(),
        amountRupees: Math.round(action.amountRupees * 100) / 100,
        type: action.entryType?.trim() || 'SMS',
        timestamp: Date.now(),
        isApproved: false,
        source: 'sms' as const,
      }

      return pushNotification(
        {
          ...state,
          transactions: [transaction, ...state.transactions],
        },
        createNotification('SMS alert ingested', `${transaction.merchant} is waiting for approval.`, 'info', '/sms'),
      )
    }
    case 'ADD_CASH_ENTRY': {
      const cashEntry = {
        id: createId('cash'),
        amountRupees: action.amountRupees,
        type: action.entryType,
        createdAt: Date.now(),
      }

      return pushNotification(
        {
          ...state,
          cashEntries: [cashEntry, ...state.cashEntries],
        },
        createNotification(
          'Cash entry saved',
          `${action.entryType === 'IN' ? 'Added' : 'Spent'} ${action.amountRupees.toFixed(2)} rupees in cash.`,
          'success',
          '/cash',
        ),
      )
    }
    case 'ADD_EMI': {
      const emi = {
        id: createId('emi'),
        name: action.name,
        amountRupees: action.amountRupees,
        dueDate: Date.now(),
        isActive: true,
        updatedAt: Date.now(),
      }

      return pushNotification(
        {
          ...state,
          emis: [emi, ...state.emis],
        },
        createNotification('EMI added', `${emi.name} is now tracked as a monthly load.`, 'success', '/emis'),
      )
    }
    case 'UPDATE_EMI': {
      const existingEmi = state.emis.find((emi) => emi.id === action.emiId)

      if (!existingEmi) {
        return state
      }

      return pushNotification(
        {
          ...state,
          emis: state.emis.map((emi) =>
            emi.id === action.emiId
              ? { ...emi, name: action.name, amountRupees: action.amountRupees, updatedAt: Date.now() }
              : emi,
          ),
        },
        createNotification('EMI updated', `${action.name} was refreshed.`, 'info', '/emis'),
      )
    }
    case 'DELETE_EMI': {
      const existingEmi = state.emis.find((emi) => emi.id === action.emiId)

      if (!existingEmi) {
        return state
      }

      return pushNotification(
        {
          ...state,
          emis: state.emis.filter((emi) => emi.id !== action.emiId),
        },
        createNotification('EMI removed', `${existingEmi.name} is no longer active.`, 'warning', '/emis'),
      )
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
      const rentSplit = buildRentSplit({
        id: createId('rent-split'),
        paidBy: state.currentUser,
        amountPaise: action.amountPaise,
        members,
        recurring: action.recurring,
        intervalDays: RENT_INTERVAL_DAYS,
        nextRunAt: timestamp + RENT_INTERVAL_DAYS * 24 * 60 * 60 * 1000,
        description,
        createdAt: timestamp,
        active: action.recurring,
      })

      if (!rentSplit) {
        return state
      }

      const nextState: TitanState = {
        ...state,
        splits: [rentSplit, ...state.splits],
      }

      if (!action.recurring) {
        return pushNotification(
          nextState,
          createNotification('Rent split created', `${description} is ready for settlement.`, 'success', '/history'),
        )
      }

      return pushNotification(
        {
          ...nextState,
          rentSchedules: [
            normalizeRentSchedule({
              id: createId('rent-schedule'),
              paidBy: state.currentUser,
              amountPaise: action.amountPaise,
              members,
              recurring: true,
              intervalDays: RENT_INTERVAL_DAYS,
              nextRunAt: timestamp + RENT_INTERVAL_DAYS * 24 * 60 * 60 * 1000,
              description,
              createdAt: timestamp,
              active: true,
            }),
            ...state.rentSchedules,
          ],
        },
        createNotification('Rent schedule registered', `Next rent cycle is scheduled in ${RENT_INTERVAL_DAYS} days.`, 'info', '/rent'),
      )
    }
    case 'RUN_DUE_RENT_SCHEDULES': {
      if (state.rentSchedules.length === 0) {
        return state
      }

      const now = Date.now()
      let nextState = state
      let ranSchedule = false

      const nextSchedules = state.rentSchedules.map((schedule) => {
        if (!schedule.active || schedule.nextRunAt > now) {
          return schedule
        }

        ranSchedule = true

        const rentSplit = buildRentSplit(schedule)
        if (rentSplit) {
          nextState = {
            ...nextState,
            splits: [rentSplit, ...nextState.splits],
          }
        }

        return normalizeRentSchedule({
          ...schedule,
          nextRunAt: schedule.nextRunAt + schedule.intervalDays * 24 * 60 * 60 * 1000,
          active: schedule.recurring,
        })
      })

      if (!ranSchedule) {
        return state
      }

      return pushNotification(
        {
          ...nextState,
          rentSchedules: nextSchedules,
        },
        createNotification('Rent cycle processed', 'A scheduled rent split has been generated.', 'success', '/rent'),
      )
    }
    default:
      return state
  }
}

export function TitanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState)
  const hasHydratedRef = useRef(false)

  useEffect(() => {
    let active = true

    titanBackend
      .loadState()
      .then((persistedState) => {
        if (!active) {
          return
        }

        hasHydratedRef.current = true
        if (!persistedState) {
          return
        }

        startTransition(() => {
          dispatch({ type: 'HYDRATE_STATE', state: persistedState })
          dispatch({ type: 'RUN_DUE_RENT_SCHEDULES' })
        })
      })
      .catch((err) => {
        hasHydratedRef.current = true
        console.warn('Failed to hydrate state from storage:', err)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      dispatch({ type: 'RUN_DUE_RENT_SCHEDULES' })
    }, 60_000)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!hasHydratedRef.current) {
      return
    }

    void titanBackend.saveState(state).catch((err) => {
      console.warn('Failed to save Titan state:', err)
    })
  }, [state])

  const trackedSpendRupees = getCurrentMonthTrackedSpendRupees(state)

  useEffect(() => {
    if (!hasHydratedRef.current || state.budget.monthlyLimitRupees <= 0) {
      return
    }

    const now = new Date()
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const budgetSummary = getBudgetSummary(
      state.budget.monthlyLimitRupees,
      trackedSpendRupees,
      state.budget.warningThresholdPercent,
    )

    let nextAlertKey = `${monthKey}:none`
    let nextNotification:
      | {
          title: string
          message: string
          kind: NotificationEntry['kind']
          href?: string
        }
      | null = null

    if (budgetSummary.status === 'OVER') {
      nextAlertKey = `${monthKey}:over`
      nextNotification = {
        title: 'Monthly budget exceeded',
        message: `Tracked spend reached INR ${trackedSpendRupees.toFixed(2)} this month.`,
        kind: 'warning',
        href: '/budget',
      }
    } else if (budgetSummary.status === 'WARNING') {
      nextAlertKey = `${monthKey}:warning`
      nextNotification = {
        title: 'Budget warning',
        message: `You have used ${budgetSummary.percentUsed}% of this month's budget.`,
        kind: 'info',
        href: '/budget',
      }
    }

    if (state.budget.lastAlertKey === nextAlertKey) {
      return
    }

    startTransition(() => {
      dispatch({ type: 'SET_BUDGET_ALERT_KEY', alertKey: nextAlertKey })

      if (nextNotification) {
        dispatch({
          type: 'ADD_NOTIFICATION',
          title: nextNotification.title,
          message: nextNotification.message,
          kind: nextNotification.kind,
          href: nextNotification.href,
        })
      }
    })
  }, [
    trackedSpendRupees,
    state.budget.lastAlertKey,
    state.budget.monthlyLimitRupees,
    state.budget.warningThresholdPercent,
  ])

  const actions = useMemo<TitanActions>(
    () => ({
    setCurrentUser(name) {
      startTransition(() => {
        dispatch({ type: 'SET_CURRENT_USER', name })
      })
    },
    updateProfile({ savingsGoalRupees }) {
      startTransition(() => {
        dispatch({ type: 'UPDATE_PROFILE', savingsGoalRupees })
        dispatch({
          type: 'ADD_NOTIFICATION',
          title: 'Profile updated',
          message: 'Your savings goal was saved locally.',
          kind: 'success',
          href: '/profile',
        })
      })
    },
    updateBudget({ monthlyLimitRupees, warningThresholdPercent }) {
      startTransition(() => {
        dispatch({
          type: 'UPDATE_BUDGET',
          monthlyLimitRupees,
          warningThresholdPercent,
        })
        dispatch({
          type: 'SET_BUDGET_ALERT_KEY',
          alertKey: undefined,
        })
        dispatch({
          type: 'ADD_NOTIFICATION',
          title: 'Budget updated',
          message: `Monthly limit set to INR ${monthlyLimitRupees.toFixed(2)}.`,
          kind: 'success',
          href: '/budget',
        })
      })
    },
    addNotification(title, message, kind = 'info', href) {
      startTransition(() => {
        dispatch({ type: 'ADD_NOTIFICATION', title, message, kind, href })
      })
    },
    dismissNotification(id) {
      startTransition(() => {
        dispatch({ type: 'DISMISS_NOTIFICATION', id })
      })
    },
    markNotificationRead(id) {
      startTransition(() => {
        dispatch({ type: 'MARK_NOTIFICATION_READ', id })
      })
    },
    markAllNotificationsRead() {
      startTransition(() => {
        dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' })
      })
    },
    clearNotifications(readOnly = false) {
      startTransition(() => {
        dispatch({ type: 'CLEAR_NOTIFICATIONS', readOnly })
      })
    },
    addSplit(payload) {
      enqueueOfflineOperation({
        type: 'ADD_SPLIT',
        entityKey: `split:${payload.groupId ?? 'ungrouped'}:${payload.description}`,
        payload: {
          amountPaise: payload.amountPaise,
          description: payload.description,
          participants: payload.participants,
          groupId: payload.groupId,
        },
      })
      startTransition(() => {
        dispatch({ type: 'ADD_SPLIT', payload })
      })
    },
    updateSplit(payload) {
      enqueueOfflineOperation({
        type: 'UPDATE_SPLIT',
        entityKey: `split:${payload.splitId}`,
        payload: {
          splitId: payload.splitId,
          amountPaise: payload.amountPaise,
          description: payload.description,
          participants: payload.participants,
          groupId: payload.groupId,
        },
      })
      startTransition(() => {
        dispatch({ type: 'UPDATE_SPLIT', splitId: payload.splitId, payload })
      })
    },
    deleteSplit(splitId) {
      enqueueOfflineOperation({
        type: 'DELETE_SPLIT',
        entityKey: `split:${splitId}`,
        payload: { splitId },
      })
      startTransition(() => {
        dispatch({ type: 'DELETE_SPLIT', splitId })
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
      enqueueOfflineOperation({
        type: 'CREATE_GROUP',
        entityKey: `group:${name}`,
        payload: { name, members },
      })
      startTransition(() => {
        dispatch({ type: 'CREATE_GROUP', name, members })
      })
    },
    updateGroup(payload) {
      enqueueOfflineOperation({
        type: 'UPDATE_GROUP',
        entityKey: `group:${payload.groupId}`,
        payload: {
          groupId: payload.groupId,
          name: payload.name,
          members: payload.members,
        },
      })
      startTransition(() => {
        dispatch({ type: 'UPDATE_GROUP', ...payload })
      })
    },
    deleteGroup(groupId) {
      enqueueOfflineOperation({
        type: 'DELETE_GROUP',
        entityKey: `group:${groupId}`,
        payload: { groupId },
      })
      startTransition(() => {
        dispatch({ type: 'DELETE_GROUP', groupId })
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
    ingestTransaction({ merchant, amountRupees, type }) {
      enqueueOfflineOperation({
        type: 'INGEST_TRANSACTION',
        entityKey: `tx:${merchant}:${Date.now()}`,
        payload: { merchant, amountRupees, type },
      })
      startTransition(() => {
        dispatch({
          type: 'INGEST_TRANSACTION',
          merchant,
          amountRupees,
          entryType: type,
        })
      })
    },
    addCashEntry(amountRupees, entryType) {
      enqueueOfflineOperation({
        type: 'ADD_CASH_ENTRY',
        entityKey: `cash:${entryType}:${Date.now()}`,
        payload: { amountRupees, entryType },
      })
      startTransition(() => {
        dispatch({ type: 'ADD_CASH_ENTRY', amountRupees, entryType })
      })
    },
    addEmi(name, amountRupees) {
      enqueueOfflineOperation({
        type: 'ADD_EMI',
        entityKey: `emi:${name}`,
        payload: { name, amountRupees },
      })
      startTransition(() => {
        dispatch({ type: 'ADD_EMI', name, amountRupees })
      })
    },
    updateEmi(payload) {
      enqueueOfflineOperation({
        type: 'UPDATE_EMI',
        entityKey: `emi:${payload.emiId}`,
        payload: {
          emiId: payload.emiId,
          name: payload.name,
          amountRupees: payload.amountRupees,
        },
      })
      startTransition(() => {
        dispatch({ type: 'UPDATE_EMI', ...payload })
      })
    },
    deleteEmi(emiId) {
      enqueueOfflineOperation({
        type: 'DELETE_EMI',
        entityKey: `emi:${emiId}`,
        payload: { emiId },
      })
      startTransition(() => {
        dispatch({ type: 'DELETE_EMI', emiId })
      })
    },
    triggerRentSplit(amountPaise, members, recurring) {
      enqueueOfflineOperation({
        type: 'TRIGGER_RENT_SPLIT',
        entityKey: `rent:${Date.now()}`,
        payload: { amountPaise, members, recurring },
      })
      startTransition(() => {
        dispatch({ type: 'TRIGGER_RENT_SPLIT', amountPaise, members, recurring })
      })
    },
    }),
    [dispatch],
  )

  return (
    <TitanStateContext.Provider value={state}>
      <TitanCurrentUserContext.Provider value={state.currentUser}>
        <TitanActionsContext.Provider value={actions}>{children}</TitanActionsContext.Provider>
      </TitanCurrentUserContext.Provider>
    </TitanStateContext.Provider>
  )
}
