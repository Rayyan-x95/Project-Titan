export type ParsedReceipt = {
  amountRupees?: number
  merchant?: string
  date?: string
  rawText: string
}

const amountPattern = /(?:INR|Rs\.?|₹)?\s*([0-9]+(?:[.,][0-9]{1,2})?)/gi
const datePattern = /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/

export function parseReceiptText(rawText: string): ParsedReceipt {
  const text = rawText.replace(/\s+/g, ' ').trim()
  const amountMatches = [...text.matchAll(amountPattern)]
  const numericAmounts = amountMatches
    .map((match) => Number(match[1].replace(/,/g, '')))
    .filter((value) => Number.isFinite(value) && value > 0)
  const amountRupees = numericAmounts.length > 0 ? Math.max(...numericAmounts) : undefined

  const firstLine = rawText.split(/\r?\n/).map((line) => line.trim()).find((line) => line.length > 2)
  const merchant = firstLine?.replace(/[^a-zA-Z0-9&' .-]/g, '').slice(0, 48) || undefined

  const date = text.match(datePattern)?.[1]

  return {
    amountRupees,
    merchant,
    date,
    rawText,
  }
}
