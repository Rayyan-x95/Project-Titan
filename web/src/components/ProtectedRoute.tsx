import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useTitanHydrated, useTitanState } from '../state/useTitan'

export function ProtectedRoute() {
  const location = useLocation()
  const hasHydrated = useTitanHydrated()
  const state = useTitanState()
  const isAuthenticated = Boolean((state.currentUser ?? '').trim())

  if (!hasHydrated) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return <Outlet />
}
