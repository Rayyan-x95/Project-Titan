import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { getExchangeRates } from '../services/exchangeRates'
import { convertAmount, detectCurrencyFromLocale, formatCurrency, type SupportedCurrency } from '../utils/currency'
import { CurrencyContext, type CurrencyContextValue } from './CurrencyContext'

const CURRENCY_KEY = 'titan-currency'
const SHOW_CONVERTED_KEY = 'titan-show-converted'

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>(() => {
    const saved = localStorage.getItem(CURRENCY_KEY)
    return (saved as SupportedCurrency) || detectCurrencyFromLocale()
  })
  const [showConverted, setShowConverted] = useState<boolean>(() => localStorage.getItem(SHOW_CONVERTED_KEY) === 'true')
  const [rates, setRates] = useState<Partial<Record<SupportedCurrency, number>>>({ INR: 1 })

  useEffect(() => {
    localStorage.setItem(CURRENCY_KEY, selectedCurrency)
  }, [selectedCurrency])

  useEffect(() => {
    localStorage.setItem(SHOW_CONVERTED_KEY, showConverted ? 'true' : 'false')
  }, [showConverted])

  useEffect(() => {
    void getExchangeRates(false).then((snapshot) => {
      setRates(snapshot.rates)
    })
  }, [])

  const value = useMemo<CurrencyContextValue>(() => ({
    selectedCurrency,
    showConverted,
    setShowConverted,
    setSelectedCurrency,
    formatINR: (amountInInr) => formatCurrency(amountInInr, 'INR'),
    formatConverted: (amountInInr) => {
      const converted = convertAmount(amountInInr, selectedCurrency, rates)
      return formatCurrency(converted, selectedCurrency)
    },
  }), [selectedCurrency, showConverted, rates])

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}
