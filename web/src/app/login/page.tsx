import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTitan } from '../../state/titan-context'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isDevAuthEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_AUTH !== 'false'

type AuthResponse = {
  user?: {
    name?: string
  }
  displayName?: string
}

async function authenticateUser(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
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
  const { addNotification, setCurrentUser } = useTitan()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

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
      addNotification('Welcome back', `Signed in as ${fallbackName}.`, 'success', '/')
      navigate('/')
      return
    }

    try {
      const authResult = await authenticateUser(email, password)

      if (!authResult) {
        addNotification('Sign-in failed', 'Unable to authenticate with the server.', 'warning')
        return
      }

      setCurrentUser(authResult.displayName)
      addNotification('Welcome back', `Signed in as ${authResult.displayName}.`, 'success', '/')
      navigate('/')
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
