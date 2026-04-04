import { createContext } from 'react'
import { Provider as TanStackProvider } from '@tanstack/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './providers/AuthProvider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

interface AppProviderProps {
  children: React.ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Provider>
          {children}
        </Provider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export const useAuth = () => {
  const { data, isLoading } = useAuth()
  return {
    isAuthenticated: data?.isAuthenticated,
    user: data?.user,
    isLoading,
  }
}

export default AppProvider
