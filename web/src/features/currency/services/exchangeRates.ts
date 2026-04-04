import type { SupportedCurrency } from '../utils/currency'

const RATES_CACHE_KEY = 'titan-rates-v1'
const RATES_TTL_MS = 1000 * 60 * 60 * 12

type RatesSnapshot = {
  updatedAt: number
  base: 'INR'
  rates: Partial<Record<SupportedCurrency, number>>
}

function readCachedRates() {
  try {
    const raw = localStorage.getItem(RATES_CACHE_KEY)
    if (!raw) {
      return null
    }

    return JSON.parse(raw) as RatesSnapshot
  } catch {
    return null
  }
}

function writeCachedRates(snapshot: RatesSnapshot) {
  try {
    localStorage.setItem(RATES_CACHE_KEY, JSON.stringify(snapshot))
  } catch {
    // Ignore storage failures and continue with in-memory result.
  }
}

export async function getExchangeRates(forceRefresh = false) {
  const cached = readCachedRates()
  const isFresh = cached && (Date.now() - cached.updatedAt) < RATES_TTL_MS

  if (!forceRefresh && isFresh) {
    return cached
  }

  try {
    const response = await fetch('https://open.er-api.com/v6/latest/INR', { cache: 'no-store' })
    const json = await response.json() as { rates?: Record<string, number> }
    const rates = json.rates ?? {}

    const snapshot: RatesSnapshot = {
      updatedAt: Date.now(),
      base: 'INR',
      rates: {
        INR: 1,
        USD: rates.USD,
        EUR: rates.EUR,
        GBP: rates.GBP,
        JPY: rates.JPY,
        AED: rates.AED,
        SGD: rates.SGD,
      },
    }

    writeCachedRates(snapshot)
    return snapshot
  } catch {
    return cached ?? {
      updatedAt: Date.now(),
      base: 'INR',
      rates: { INR: 1 },
    }
  }
}
