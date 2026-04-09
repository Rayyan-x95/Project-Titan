import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useTitanState } from '../state/useTitan'

export function ProtectedRoute() {
  const location = useLocation()
  const state = useTitanState()
  const isAuthenticated = Boolean((state.currentUser ?? '').trim())

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return <Outlet />
}
