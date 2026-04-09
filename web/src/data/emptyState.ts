import type { TitanState } from '../types'

export const emptyState: TitanState = {
  currentUser: '',
  groups: [],
  splits: [],
  transactions: [],
  cashEntries: [],
  emis: [],
  notifications: [],
  profile: {
    savingsGoalRupees: 0,
  },
  budget: {
    monthlyLimitRupees: 0,
    warningThresholdPercent: 80,
  },
  rentSchedules: [],
}
