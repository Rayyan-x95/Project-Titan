import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authenticateLocalAccount } from '../../services/local-auth'
import { useTitanActions, useTitanHydrated, useTitanState } from '../../state/useTitan'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isDevAuthEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_AUTH !== 'false'
const authApiEndpoint = import.meta.env.VITE_AUTH_API_URL?.trim()
const hasAuthApiEndpoint = Boolean(authApiEndpoint)

type AuthResponse = {
  user?: {
    name?: string
  }
  displayName?: string
}

async function authenticateUser(email: string, password: string) {
  if (!authApiEndpoint) {
    return null
  }

  const response = await fetch(authApiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return null
  }

  const payload = (await response.json()) as AuthResponse
  const fallbackName = email.split('@')[0]?.trim() || email
  const displayName = payload.user?.name?.trim() || payload.displayName?.trim() || fallbackName

  return {
    displayName,
  }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = useTitanState()
  const hasHydrated = useTitanHydrated()
  const { addNotification, setCurrentUser } = useTitanActions()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const fromLocation = (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from
  const redirectTarget = fromLocation?.pathname
    ? `${fromLocation.pathname}${fromLocation.search ?? ''}${fromLocation.hash ?? ''}`
    : '/'

  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    if (!state.currentUser.trim()) {
      return
    }

    navigate(redirectTarget, { replace: true })
  }, [hasHydrated, navigate, redirectTarget, state.currentUser])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const email = formData.email.trim()
    const password = formData.password

    if (!email || !password) {
      addNotification('Missing credentials', 'Please enter both email and password.', 'warning')
      return
    }

    if (!EMAIL_PATTERN.test(email)) {
      addNotification('Invalid email', 'Please enter a valid email address.', 'warning')
      return
    }

    if (isDevAuthEnabled) {
      // Development auth mode: skips backend authentication for local testing.
      // In production (VITE_ENABLE_DEV_AUTH unset or 'false'), this branch is disabled
      // and the full authenticateUser() flow is required.
      const fallbackName = email.split('@')[0]?.trim() || email
      setCurrentUser(fallbackName)
      addNotification('Welcome back', `Signed in as ${fallbackName}.`, 'success', redirectTarget)
      navigate(redirectTarget)
      return
    }

    try {
      if (!hasAuthApiEndpoint) {
        const localAccount = await authenticateLocalAccount(email, password)

        if (!localAccount) {
          addNotification(
            'Sign-in failed',
            'No cloud auth endpoint is configured and no matching local account was found.',
            'warning',
          )
          return
        }

        setCurrentUser(localAccount.displayName)
        addNotification(
          'Signed in locally',
          `Welcome back, ${localAccount.displayName}. This device is using local-only auth.`,
          'info',
          redirectTarget,
        )
        navigate(redirectTarget)
        return
      }

      const authResult = await authenticateUser(email, password)

      if (!authResult) {
        addNotification('Sign-in failed', 'Unable to authenticate with the server.', 'warning')
        return
      }

      setCurrentUser(authResult.displayName)
      addNotification('Welcome back', `Signed in as ${authResult.displayName}.`, 'success', redirectTarget)
      navigate(redirectTarget)
    } catch {
      addNotification('Sign-in failed', 'Unable to authenticate with the server.', 'warning')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              placeholder="Enter your email"
              type="email"
              value={formData.email}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              onChange={(event) => setFormData({ ...formData, password: event.target.value })}
              placeholder="Enter your password"
              type="password"
              value={formData.password}
            />
          </div>
          <button className="auth-btn" type="submit">
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
