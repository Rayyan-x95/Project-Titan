import { useContext } from 'react'
import { TitanContext } from './titan-context'

export function useTitan() {
  const context = useContext(TitanContext)

  if (!context) {
    throw new Error('useTitan must be used within TitanProvider')
  }

  return context
}
