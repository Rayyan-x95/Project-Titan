import type { ReactNode } from 'react'
import { CurrencyProvider } from '../features/currency/components/CurrencyProvider'
import { TitanProvider } from '../state/TitanStore'

type AppProviderProps = {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <TitanProvider>
      <CurrencyProvider>{children}</CurrencyProvider>
    </TitanProvider>
  )
}

export default AppProvider
