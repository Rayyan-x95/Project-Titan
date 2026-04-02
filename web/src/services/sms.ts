export type SmsAlertDraft = {
  merchant: string
  amountRupees: number
  rawMessage: string
}

function getAmountMatch(message: string) {
  const currencyMatch = message.match(/(?:₹|INR|Rs\.?|rupees?)\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/i)

  if (currencyMatch?.[1]) {
    return currencyMatch[1]
  }

  const trailingNumberMatch = message.match(/([0-9][0-9,]*(?:\.[0-9]{1,2})?)\s*(?:credited|debited|spent|paid|txn|transaction|at|from)?/i)
  return trailingNumberMatch?.[1] ?? ''
}

export function parseSmsAlert(message: string): SmsAlertDraft | null {
  const trimmed = message.trim()

  if (!trimmed) {
    return null
  }

  const merchantMatch =
    trimmed.match(/(?:at|from|to)\s+([A-Za-z0-9&.'’\- ]{2,40})/i) ??
    trimmed.match(/([A-Za-z][A-Za-z0-9&.'’\- ]{2,40})/)

  const amountMatch = getAmountMatch(trimmed)
  const amountRupees = Number(amountMatch.replace(/,/g, ''))

  if (!merchantMatch?.[1] || !Number.isFinite(amountRupees) || amountRupees <= 0) {
    return null
  }

  return {
    merchant: merchantMatch[1].trim(),
    amountRupees,
    rawMessage: trimmed,
  }
}