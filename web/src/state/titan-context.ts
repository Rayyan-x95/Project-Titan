import { createContext } from 'react'
import type { TitanState } from '../types'

export type AddSplitPayload = {
  amountPaise: number
  description: string
  participants: string[]
  groupId?: string
}

export type UpdateSplitPayload = AddSplitPayload & {
  splitId: string
}

export type UpdateGroupPayload = {
  groupId: string
  name: string
  members: string[]
}

export type UpdateEmiPayload = {
  emiId: string
  name: string
  amountRupees: number
}

export type TitanActions = {
  setCurrentUser: (name: string) => void
  addSplit: (payload: AddSplitPayload) => void
  updateSplit: (payload: UpdateSplitPayload) => void
  deleteSplit: (splitId: string) => void
  settlePartial: (splitId: string, participantId: string, amountPaise: number) => void
  settleFull: (splitId: string, participantId: string) => void
  createGroup: (name: string, members: string[]) => void
  updateGroup: (payload: UpdateGroupPayload) => void
  deleteGroup: (groupId: string) => void
  approveTransaction: (transactionId: string) => void
  deleteTransaction: (transactionId: string) => void
  ingestTransaction: (payload: { merchant: string; amountRupees: number; type?: string }) => void
  addCashEntry: (amountRupees: number, entryType: 'IN' | 'OUT') => void
  addEmi: (name: string, amountRupees: number) => void
  updateEmi: (payload: UpdateEmiPayload) => void
  deleteEmi: (emiId: string) => void
  triggerRentSplit: (amountPaise: number, members: string[], recurring: boolean) => void
}

export const TitanStateContext = createContext<TitanState | null>(null)
export const TitanActionsContext = createContext<TitanActions | null>(null)
