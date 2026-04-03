export function parseAmountInput(rawValue: string) {
  const normalized = rawValue
    .replaceAll(',', '')
    .replace(/[^\d.-]/g, '')
    .trim()

  if (!normalized || normalized === '-' || normalized === '.' || normalized === '-.') {
    return null
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

export function normalizeSearchText(value: string) {
  return value.trim().toLowerCase()
}
