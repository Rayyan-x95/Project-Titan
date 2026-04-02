export type Split = {
  id: string
  amountPaise: number
  description: string
  paidBy: string
  participants: string[]
  participantShares: Record<string, number>
  participantSettlements: Record<string, number>
  createdAt: number
  isSettled: boolean
  settledAmountPaise: number
  updatedAt: number
  groupId?: string
}

export type Group = {
  id: string
  name: string
  members: string[]
  createdAt: number
  updatedAt?: number
}

export type Transaction = {
  id: string
  merchant: string
  amountRupees: number
  type: string
  timestamp: number
  isApproved: boolean
  source?: 'manual' | 'sms-simulated' | 'imported'
}

export type CashEntry = {
  id: string
  amountRupees: number
  type: 'IN' | 'OUT'
  createdAt: number
  label?: string
}

export type Emi = {
  id: string
  name: string
  amountRupees: number
  dueDate: number
  isActive: boolean
  updatedAt?: number
}

export type NotificationEntry = {
  id: string
  title: string
  message: string
  kind: 'info' | 'success' | 'warning'
  createdAt: number
  read: boolean
  href?: string
}

export type RentSchedule = {
  id: string
  paidBy: string
  amountPaise: number
  members: string[]
  recurring: boolean
  intervalDays: number
  nextRunAt: number
  description: string
  createdAt: number
  active: boolean
}

export type TitanState = {
  currentUser: string
  splits: Split[]
  groups: Group[]
  transactions: Transaction[]
  cashEntries: CashEntry[]
  emis: Emi[]
  notifications: NotificationEntry[]
  rentSchedules: RentSchedule[]
}

export type PersonBalance = {
  personId: string
  amountPaise: number
}

export type SummaryInsights = {
  totalPendingAmountPaise: number
  peopleWhoOweCount: number
  oldestPendingSplit?: Split
}

export type GroupMemberBalance = {
  personId: string
  netBalancePaise: number
}

export type OptimizedPayment = {
  from: string
  to: string
  amountPaise: number
}

export type FinancialHealthStatus = 'GOOD' | 'MODERATE' | 'RISKY'

export type HealthScore = {
  score: number
  status: FinancialHealthStatus
  recommendation: string
}

export type SpendingTrigger = {
  title: string
  description: string
  impact: 'Risky' | 'High' | 'Neutral'
}

export type SpendTrend = {
  totalRupees: number
  splitShareRupees: number
  cashSpentRupees: number
  timeLabel: string
}

export type ReverseInsight = {
  amountRupees: number
  valueInContext: string
}
