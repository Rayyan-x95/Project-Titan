import type {
  BudgetSummary,
  CashEntry,
  Emi,
  Group,
  GroupMemberBalance,
  HealthScore,
  OptimizedPayment,
  PersonBalance,
  ReverseInsight,
  Split,
  SpendTrend,
  SpendingTrigger,
  SummaryInsights,
  TitanState,
  Transaction,
} from '../types'

// Configuration constants
export const OVERSPENDING_THRESHOLD_RUPEES = 10000
export const MAX_AMOUNT_PAISE = 10_000_000_00
export const MAX_AMOUNT_RUPEES = 10_000_000

const paiseFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const rupeeFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
})

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

function sumPaise(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

export function sanitizeParticipantList(participants: string[], paidBy?: string) {
  const cleanedParticipants: string[] = []
  const seen = new Set<string>()

  participants.forEach((participant) => {
    const cleanedParticipant = participant.trim()

    if (
      !cleanedParticipant ||
      cleanedParticipant === paidBy ||
      seen.has(cleanedParticipant)
    ) {
      return
    }

    seen.add(cleanedParticipant)
    cleanedParticipants.push(cleanedParticipant)
  })

  return cleanedParticipants
}

export function createParticipantShareMap(
  participants: string[],
  amountPaise: number,
): Record<string, number> {
  const totalPaise = Math.max(Math.round(amountPaise), 0)

  if (participants.length === 0 || totalPaise <= 0) {
    return {}
  }

  const baseShare = Math.floor(totalPaise / participants.length)
  let remainder = totalPaise % participants.length

  return Object.fromEntries(
    participants.map((participant) => {
      const share = baseShare + (remainder > 0 ? 1 : 0)
      remainder = Math.max(remainder - 1, 0)

      return [participant, share]
    }),
  )
}

export function normalizeParticipantSettlementMap(
  participants: string[],
  participantShares: Record<string, number>,
  participantSettlements?: Record<string, number>,
  legacySettledAmountPaise = 0,
): Record<string, number> {
  const normalizedSettlements: Record<string, number> = Object.fromEntries(
    participants.map((participant) => {
      const share = participantShares[participant] ?? 0
      const existingSettlement = Math.round(
        Math.max(participantSettlements?.[participant] ?? 0, 0),
      )

      return [participant, Math.min(share, existingSettlement)]
    }),
  )

  if (sumPaise(Object.values(normalizedSettlements)) > 0 || legacySettledAmountPaise <= 0) {
    return normalizedSettlements
  }

  const totalSharePaise = sumPaise(
    participants.map((participant) => participantShares[participant] ?? 0),
  )
  const targetSettledAmountPaise = Math.min(
    Math.round(Math.max(legacySettledAmountPaise, 0)),
    totalSharePaise,
  )

  if (targetSettledAmountPaise <= 0 || totalSharePaise <= 0) {
    return normalizedSettlements
  }

  // Legacy splits only stored aggregate settlements, so apportion them by share
  // instead of pretending the first listed participants paid first.
  const distributedSettlements = participants.map((participant, index) => {
    const share = participantShares[participant] ?? 0
    const exactSettlement = (targetSettledAmountPaise * share) / totalSharePaise
    const settledPaise = Math.min(share, Math.floor(exactSettlement))

    return {
      participant,
      index,
      share,
      settledPaise,
      fractionalRemainder: exactSettlement - settledPaise,
    }
  })

  let remainingSettledAmount =
    targetSettledAmountPaise -
    sumPaise(distributedSettlements.map((item) => item.settledPaise))

  distributedSettlements
    .filter((item) => item.share > item.settledPaise)
    .sort((left, right) => {
      if (right.fractionalRemainder !== left.fractionalRemainder) {
        return right.fractionalRemainder - left.fractionalRemainder
      }

      return left.index - right.index
    })
    .some((item) => {
      if (remainingSettledAmount <= 0) {
        return true
      }

      item.settledPaise += 1
      remainingSettledAmount -= 1
      return false
    })

  distributedSettlements.forEach((item) => {
    normalizedSettlements[item.participant] = item.settledPaise
  })

  return normalizedSettlements
}

export function formatPaise(amountPaise: number) {
  const prefix = amountPaise < 0 ? '-' : ''
  return `${prefix}INR ${paiseFormatter.format(Math.abs(amountPaise) / 100)}`
}

export function formatRupees(amountRupees: number) {
  const prefix = amountRupees < 0 ? '-' : ''
  return `${prefix}INR ${rupeeFormatter.format(Math.abs(amountRupees))}`
}

export function formatDate(timestamp: number) {
  return dateFormatter.format(timestamp)
}

export function getOutstandingAmountPaise(split: Split) {
  return sumPaise(
    split.participants.map((participant) =>
      getParticipantOutstandingPaise(split, participant),
    ),
  )
}

export function getParticipantSharePaise(split: Split, participantId: string) {
  return split.participantShares[participantId] ?? 0
}

export function getParticipantSettledPaise(split: Split, participantId: string) {
  return Math.min(
    getParticipantSharePaise(split, participantId),
    Math.max(split.participantSettlements[participantId] ?? 0, 0),
  )
}

export function getParticipantOutstandingPaise(split: Split, participantId: string) {
  return Math.max(
    getParticipantSharePaise(split, participantId) -
      getParticipantSettledPaise(split, participantId),
    0,
  )
}

export function getSettledAmountPaise(split: Split) {
  return sumPaise(
    split.participants.map((participant) =>
      getParticipantSettledPaise(split, participant),
    ),
  )
}

export function isSplitSettled(split: Split) {
  return getOutstandingAmountPaise(split) <= 0
}

export function getPersonSplitOutstandingPaise(
  split: Split,
  currentUser: string,
  personId: string,
) {
  if (split.paidBy === currentUser) {
    return getParticipantOutstandingPaise(split, personId)
  }

  if (split.paidBy === personId) {
    return getParticipantOutstandingPaise(split, currentUser)
  }

  return 0
}

export function getSettlementParticipantId(
  split: Split,
  currentUser: string,
  personId: string,
) {
  if (split.paidBy === currentUser && split.participants.includes(personId)) {
    return personId
  }

  if (split.paidBy === personId && split.participants.includes(currentUser)) {
    return currentUser
  }

  return ''
}

export function getKnownPeople(state: TitanState) {
  const people = new Set<string>()

  state.groups.forEach((group) => {
    group.members.forEach((member) => {
      if (member !== state.currentUser) {
        people.add(member)
      }
    })
  })

  state.splits.forEach((split) => {
    if (split.paidBy !== state.currentUser) {
      people.add(split.paidBy)
    }

    split.participants.forEach((participant) => {
      if (participant !== state.currentUser) {
        people.add(participant)
      }
    })
  })

  return [...people].sort((left, right) => left.localeCompare(right))
}

export function getPersonBalances(splits: Split[], currentUser: string) {
  const balances = new Map<string, number>()

  splits.forEach((split) => {
    if (split.paidBy === currentUser) {
      split.participants.forEach((participant) => {
        const outstandingPaise = getParticipantOutstandingPaise(split, participant)

        if (outstandingPaise > 0) {
          balances.set(
            participant,
            (balances.get(participant) ?? 0) + outstandingPaise,
          )
        }
      })
      return
    }

    if (split.participants.includes(currentUser)) {
      const outstandingPaise = getParticipantOutstandingPaise(split, currentUser)

      if (outstandingPaise > 0) {
        balances.set(
          split.paidBy,
          (balances.get(split.paidBy) ?? 0) - outstandingPaise,
        )
      }
    }
  })

  return [...balances.entries()]
    .map<PersonBalance>(([personId, amountPaise]) => ({ personId, amountPaise }))
    .sort((left, right) => Math.abs(right.amountPaise) - Math.abs(left.amountPaise))
}

export function getTotalOwedPaise(balances: PersonBalance[]) {
  return balances
    .filter((balance) => balance.amountPaise > 0)
    .reduce((total, balance) => total + balance.amountPaise, 0)
}

export function getTotalOwePaise(balances: PersonBalance[]) {
  return Math.abs(
    balances
      .filter((balance) => balance.amountPaise < 0)
      .reduce((total, balance) => total + balance.amountPaise, 0),
  )
}

export function getSummaryInsights(splits: Split[], currentUser: string) {
  const pending = splits.filter(
    (split) =>
      !isSplitSettled(split) &&
      split.paidBy === currentUser &&
      getOutstandingAmountPaise(split) > 0,
  )

  const totalPendingAmountPaise = pending.reduce(
    (total, split) => total + getOutstandingAmountPaise(split),
    0,
  )

  const peopleWhoOweCount = new Set(
    pending.flatMap((split) =>
      split.participants.filter(
        (participant) => getParticipantOutstandingPaise(split, participant) > 0,
      ),
    ),
  ).size

  const oldestPendingSplit = [...pending].sort((left, right) => left.createdAt - right.createdAt)[0]

  return {
    totalPendingAmountPaise,
    peopleWhoOweCount,
    oldestPendingSplit,
  } satisfies SummaryInsights
}

export function getSplitsForPerson(splits: Split[], currentUser: string, personId: string) {
  return splits
    .filter(
      (split) =>
        (split.paidBy === currentUser && split.participants.includes(personId)) ||
        (split.paidBy === personId && split.participants.includes(currentUser)),
    )
    .sort((left, right) => right.createdAt - left.createdAt)
}

export function getGroupBalances(splits: Split[], groupId: string) {
  const balanceMap = new Map<string, number>()

  splits
    .filter((split) => split.groupId === groupId)
    .forEach((split) => {
      split.participants.forEach((participant) => {
        const outstandingPaise = getParticipantOutstandingPaise(split, participant)

        if (outstandingPaise > 0) {
          balanceMap.set(
            split.paidBy,
            (balanceMap.get(split.paidBy) ?? 0) + outstandingPaise,
          )
          balanceMap.set(
            participant,
            (balanceMap.get(participant) ?? 0) - outstandingPaise,
          )
        }
      })
    })

  return [...balanceMap.entries()]
    .map<GroupMemberBalance>(([personId, netBalancePaise]) => ({
      personId,
      netBalancePaise,
    }))
    .sort((left, right) => right.netBalancePaise - left.netBalancePaise)
}

export function simplifyGroupSettlement(balances: GroupMemberBalance[]) {
  const debtors = balances
    .filter((balance) => balance.netBalancePaise < 0)
    .map((balance) => ({ ...balance, netBalancePaise: Math.abs(balance.netBalancePaise) }))

  const creditors = balances
    .filter((balance) => balance.netBalancePaise > 0)
    .map((balance) => ({ ...balance }))

  const optimized: OptimizedPayment[] = []
  let debtorIndex = 0
  let creditorIndex = 0

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex]
    const creditor = creditors[creditorIndex]
    const amountPaise = Math.min(debtor.netBalancePaise, creditor.netBalancePaise)

    optimized.push({
      from: debtor.personId,
      to: creditor.personId,
      amountPaise,
    })

    debtor.netBalancePaise -= amountPaise
    creditor.netBalancePaise -= amountPaise

    if (debtor.netBalancePaise <= 0) {
      debtorIndex += 1
    }

    if (creditor.netBalancePaise <= 0) {
      creditorIndex += 1
    }
  }

  return optimized
}

function getTimelineTotals(
  splits: Split[],
  cashEntries: CashEntry[],
  transactions: Transaction[],
  fromTimestamp: number,
) {
  const splitShareRupees = splits
    .filter((split) => split.createdAt >= fromTimestamp)
    .reduce((total, split) => total + split.amountPaise / 100, 0)

  const cashSpentRupees = cashEntries
    .filter((entry) => entry.type === 'OUT' && entry.createdAt >= fromTimestamp)
    .reduce((total, entry) => total + entry.amountRupees, 0)

  const approvedTransactionsRupees = transactions
    .filter((transaction) => transaction.isApproved && transaction.timestamp >= fromTimestamp)
    .reduce((total, transaction) => total + transaction.amountRupees, 0)

  return {
    totalRupees: splitShareRupees + cashSpentRupees + approvedTransactionsRupees,
    splitShareRupees,
    cashSpentRupees,
  }
}

export function getSpendTrends(
  splits: Split[],
  cashEntries: CashEntry[],
  transactions: Transaction[],
) {
  const now = Date.now()
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000

  return [
    { ...getTimelineTotals(splits, cashEntries, transactions, weekAgo), timeLabel: 'THIS WEEK' },
    { ...getTimelineTotals(splits, cashEntries, transactions, monthAgo), timeLabel: 'THIS MONTH' },
    { ...getTimelineTotals(splits, cashEntries, transactions, 0), timeLabel: 'ALL TIME' },
  ] satisfies SpendTrend[]
}

export function isOverspending(splits: Split[], transactions: Transaction[]) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const splitRupees = splits
    .filter((split) => split.createdAt >= weekAgo)
    .reduce((total, split) => total + split.amountPaise / 100, 0)
  const transactionRupees = transactions
    .filter((transaction) => transaction.isApproved && transaction.timestamp >= weekAgo)
    .reduce((total, transaction) => total + transaction.amountRupees, 0)

  return splitRupees + transactionRupees > OVERSPENDING_THRESHOLD_RUPEES
}

export function getAlwaysPaysFirstPercentage(splits: Split[], currentUser: string) {
  if (splits.length === 0) {
    return 0
  }

  const paidCount = splits.filter((split) => split.paidBy === currentUser).length
  return Math.round((paidCount / splits.length) * 100)
}

export function getHealthScore(emis: Emi[], splits: Split[]) {
  const emiLoad = emis.filter((emi) => emi.isActive).reduce((total, emi) => total + emi.amountRupees, 0)
  const pendingRupees = splits.reduce(
    (total, split) => total + getOutstandingAmountPaise(split) / 100,
    0,
  )

  let score = 85

  if (emiLoad > 10000) {
    score -= 20
  }

  if (pendingRupees > 5000) {
    score -= 10
  }

  if (emiLoad > 15000) {
    score -= 10
  }

  if (score >= 75) {
    return {
      score,
      status: 'GOOD',
      recommendation: 'Flow is stable. Keep approvals tight and settle dues early.',
    } satisfies HealthScore
  }

  if (score >= 50) {
    return {
      score,
      status: 'MODERATE',
      recommendation: 'Trim smaller spends and close a pending split this week.',
    } satisfies HealthScore
  }

  return {
    score,
    status: 'RISKY',
    recommendation: 'EMI load is heavy. Pause new shared spends until one cycle clears.',
  } satisfies HealthScore
}

export function getSpendingTriggers(splits: Split[], transactions: Transaction[]) {
  const weekendCount = [...splits.map((split) => split.createdAt), ...transactions.map((item) => item.timestamp)]
    .map((timestamp) => new Date(timestamp).getDay())
    .filter((day) => day === 0 || day === 6).length

  const smallSpends = transactions.filter((transaction) => transaction.amountRupees < 200).length
  const triggers: SpendingTrigger[] = []

  if (weekendCount > 5) {
    triggers.push({
      title: 'Weekend spender',
      description: 'Your biggest burst of activity still lands between Friday night and Sunday.',
      impact: 'High',
    })
  }

  if (smallSpends > 2) {
    triggers.push({
      title: 'Micro-spend drift',
      description: 'Tiny late-night spends are stacking up faster than the larger planned ones.',
      impact: 'Risky',
    })
  }

  if (triggers.length === 0) {
    triggers.push({
      title: 'No obvious trigger',
      description: 'Current behavior looks steady. Keep using approvals to stop noise early.',
      impact: 'Neutral',
    })
  }

  return triggers
}

export function mapReverseInsight(amountRupees: number) {
  if (amountRupees < 500) {
    return {
      amountRupees,
      valueInContext: 'about two late-night cafe runs',
    } satisfies ReverseInsight
  }

  if (amountRupees < 1500) {
    return {
      amountRupees,
      valueInContext: 'roughly three full meals',
    } satisfies ReverseInsight
  }

  if (amountRupees < 5000) {
    return {
      amountRupees,
      valueInContext: 'about one weekend fuel plan',
    } satisfies ReverseInsight
  }

  return {
    amountRupees,
    valueInContext: 'nearly half a phone EMI',
  } satisfies ReverseInsight
}

export function getCashBalance(cashEntries: CashEntry[]) {
  return cashEntries.reduce((total, entry) => {
    return total + (entry.type === 'IN' ? entry.amountRupees : -entry.amountRupees)
  }, 0)
}

export function getCurrentMonthTrackedSpendRupees(
  state: Pick<TitanState, 'splits' | 'cashEntries' | 'transactions'>,
  referenceTimestamp = Date.now(),
) {
  const referenceDate = new Date(referenceTimestamp)
  const monthStart = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    1,
  ).getTime()

  const splitSpendRupees = state.splits
    .filter((split) => split.createdAt >= monthStart)
    .reduce((total, split) => total + split.amountPaise / 100, 0)

  const cashSpendRupees = state.cashEntries
    .filter((entry) => entry.type === 'OUT' && entry.createdAt >= monthStart)
    .reduce((total, entry) => total + entry.amountRupees, 0)

  const approvedTransactionsRupees = state.transactions
    .filter((transaction) => transaction.isApproved && transaction.timestamp >= monthStart)
    .reduce((total, transaction) => total + transaction.amountRupees, 0)

  return splitSpendRupees + cashSpendRupees + approvedTransactionsRupees
}

export function getBudgetSummary(
  monthlyLimitRupees: number,
  trackedSpendRupees: number,
  warningThresholdPercent: number,
): BudgetSummary {
  if (monthlyLimitRupees <= 0) {
    return {
      status: 'NOT_SET',
      monthlyLimitRupees,
      trackedSpendRupees,
      remainingRupees: 0,
      percentUsed: 0,
      warningThresholdPercent,
      recommendation: 'Set a monthly budget to unlock pacing alerts and remaining-spend guidance.',
    }
  }

  const remainingRupees = monthlyLimitRupees - trackedSpendRupees
  const percentUsed = Math.max(
    0,
    Math.round((trackedSpendRupees / monthlyLimitRupees) * 100),
  )

  if (trackedSpendRupees >= monthlyLimitRupees) {
    return {
      status: 'OVER',
      monthlyLimitRupees,
      trackedSpendRupees,
      remainingRupees,
      percentUsed,
      warningThresholdPercent,
      recommendation: 'This month is over budget. Pause non-essential spending and settle open balances first.',
    }
  }

  if (percentUsed >= warningThresholdPercent) {
    return {
      status: 'WARNING',
      monthlyLimitRupees,
      trackedSpendRupees,
      remainingRupees,
      percentUsed,
      warningThresholdPercent,
      recommendation: 'You are near your monthly limit. Prefer cash-ins, delay extras, and avoid fresh EMI load.',
    }
  }

  return {
    status: 'ON_TRACK',
    monthlyLimitRupees,
    trackedSpendRupees,
    remainingRupees,
    percentUsed,
    warningThresholdPercent,
    recommendation: 'Spending is within the target range. Keep approvals tight and review again before the weekend.',
  }
}

export function findGroup(groups: Group[], groupId?: string) {
  return groups.find((group) => group.id === groupId)
}
