import { useContext } from 'react'
import { CurrencyContext } from '../components/CurrencyContext'

export function useCurrency() {
  const value = useContext(CurrencyContext)

  if (!value) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }

  return value
}
