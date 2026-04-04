import { createContext } from 'react'
import type { SupportedCurrency } from '../utils/currency'

export type CurrencyContextValue = {
  selectedCurrency: SupportedCurrency
  showConverted: boolean
  setShowConverted: (nextValue: boolean) => void
  setSelectedCurrency: (currency: SupportedCurrency) => void
  formatINR: (amountInInr: number) => string
  formatConverted: (amountInInr: number) => string
}

export const CurrencyContext = createContext<CurrencyContextValue | null>(null)
