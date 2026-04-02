import { createContext } from 'react'
import type { TitanState } from '../types'

type AddSplitPayload = {
  amountPaise: number
  description: string
  participants: string[]
  groupId?: string
}

export type TitanContextValue = {
  state: TitanState
  setCurrentUser: (name: string) => void
  addSplit: (payload: AddSplitPayload) => void
  settlePartial: (splitId: string, participantId: string, amountPaise: number) => void
  settleFull: (splitId: string, participantId: string) => void
  createGroup: (name: string, members: string[]) => void
  approveTransaction: (transactionId: string) => void
  deleteTransaction: (transactionId: string) => void
  addCashEntry: (amountRupees: number, entryType: 'IN' | 'OUT') => void
  addEmi: (name: string, amountRupees: number) => void
  triggerRentSplit: (amountPaise: number, members: string[], recurring: boolean) => void
}

export const TitanContext = createContext<TitanContextValue | null>(null)
