import { createContext, useContext } from 'react'
import type { NotificationEntry, TitanState } from '../types'

export type AddSplitInput = {
  amountPaise: number
  description: string
  participants: string[]
  groupId?: string
}

export type UpdateSplitInput = AddSplitInput & {
  splitId: string
}

export type UpdateGroupInput = {
  groupId: string
  name: string
  members: string[]
}

export type IngestTransactionInput = {
  merchant: string
  amountRupees: number
  type?: string
}

export type UpdateEmiInput = {
  emiId: string
  name: string
  amountRupees: number
}

export type TitanActions = {
  setCurrentUser: (name: string) => void
  updateProfile: (payload: { savingsGoalRupees: number }) => void
  updateBudget: (payload: {
    monthlyLimitRupees: number
    warningThresholdPercent: number
  }) => void
  addSplit: (payload: AddSplitInput) => void
  updateSplit: (payload: UpdateSplitInput) => void
  deleteSplit: (splitId: string) => void
  settlePartial: (splitId: string, participantId: string, amountPaise: number) => void
  settleFull: (splitId: string, participantId: string) => void
  createGroup: (name: string, members: string[]) => void
  updateGroup: (payload: UpdateGroupInput) => void
  deleteGroup: (groupId: string) => void
  approveTransaction: (transactionId: string) => void
  deleteTransaction: (transactionId: string) => void
  ingestTransaction: (payload: IngestTransactionInput) => void
  addCashEntry: (amountRupees: number, entryType: 'IN' | 'OUT') => void
  addEmi: (name: string, amountRupees: number) => void
  updateEmi: (payload: UpdateEmiInput) => void
  deleteEmi: (emiId: string) => void
  triggerRentSplit: (amountPaise: number, members: string[], recurring: boolean) => void
  addNotification: (
    title: string,
    message: string,
    kind?: NotificationEntry['kind'],
    href?: string,
  ) => void
  dismissNotification: (id: string) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  clearNotifications: (readOnly?: boolean) => void
}

export const TitanStateContext = createContext<TitanState | undefined>(undefined)
export const TitanActionsContext = createContext<TitanActions | undefined>(undefined)
export const TitanCurrentUserContext = createContext<string | null>(null)

type TitanLegacyNotification = {
  id: string
  title: string
  message: string
  type: NotificationEntry['kind']
  timestamp: number
  read: boolean
  href?: string
}

export function useTitan() {
  const state = useContext(TitanStateContext)
  const actions = useContext(TitanActionsContext)

  if (!state || !actions) {
    throw new Error('useTitan must be used within TitanProvider')
  }

  const legacyNotifications: TitanLegacyNotification[] = state.notifications.map((notification) => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.kind,
    timestamp: notification.createdAt,
    read: notification.read,
    href: notification.href,
  }))

  // TODO(TITAN-AUTH-102): Replace this compatibility id with a persistent stable id from state.currentUserId.
  const legacyUserId = state.currentUser
    ? state.currentUser
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
    : ''

  return {
    ...state,
    ...actions,
    notifications: legacyNotifications,
    isAuthenticated: Boolean(state.currentUser),
    isLoading: false,
    user: state.currentUser
      ? {
          id: legacyUserId || 'legacy-user',
          name: state.currentUser,
          email: '',
          avatar: '',
          role: 'owner' as const,
        }
      : null,
    theme: 'light' as const,
    preferences: {
      showNotification: true,
      language: 'en-IN',
      currency: 'INR',
      theme: 'light' as const,
    },
    profile: state.profile,
    budget: state.budget,
  }
}
