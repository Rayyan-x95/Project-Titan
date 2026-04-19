import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerLocalAccount } from '../../services/local-auth'
import { useTitanActions } from '../../state/useTitan'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const registerApiEndpoint = import.meta.env.VITE_AUTH_REGISTER_API_URL?.trim()

type RegisterRemoteSuccess = {
  ok: true
  displayName: string
}

type RegisterRemoteFailure = {
  ok: false
  error: 'not_configured' | 'registration_failed'
  status?: number
  message?: string
  details?: string
}

type RegisterRemoteResult = RegisterRemoteSuccess | RegisterRemoteFailure

async function registerRemoteAccount(input: {
  firstName: string
  lastName: string
  email: string
  password: string
}): Promise<RegisterRemoteResult> {
  if (!registerApiEndpoint) {
    return { ok: false, error: 'not_configured' }
  }

  const response = await fetch(registerApiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  if (!response.ok) {
    let message = 'Unable to create account with the configured registration endpoint.'
    let details: string | undefined

    if (isJson) {
      const payload = (await response.json().catch(() => null)) as
        | {
            message?: string
            error?: string
            details?: string
            code?: string
          }
        | null

      message = payload?.message?.trim() || payload?.error?.trim() || message
      details = payload?.details?.trim() || payload?.code?.trim()
    }

    return {
      ok: false,
      error: 'registration_failed',
      status: response.status,
      message,
      details,
    }
  }

  if (!isJson) {
    return {
      ok: false,
      error: 'registration_failed',
      status: response.status,
      message: 'Registration endpoint returned an unsupported response format.',
    }
  }

  const payload = (await response.json()) as {
    user?: {
      name?: string
    }
    displayName?: string
  }

  const fallbackName = `${input.firstName} ${input.lastName}`.trim() || input.email.split('@')[0] || input.email
  return {
    ok: true,
    displayName: payload.user?.name?.trim() || payload.displayName?.trim() || fallbackName,
  }
}

export default function RegistrationPage() {
  const navigate = useNavigate()
  const { addNotification, setCurrentUser } = useTitanActions()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    const email = formData.email.trim()

    if (!email) {
      addNotification('Missing email', 'Please enter your email address.', 'warning')
      return
    }

    if (!EMAIL_PATTERN.test(email)) {
      addNotification('Invalid email', 'Please enter a valid email address.', 'warning')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      addNotification('Password mismatch', 'Please make sure both passwords match.', 'warning')
      return
    }

    if (!formData.password.trim()) {
      addNotification('Missing password', 'Please create a password for your account.', 'warning')
      return
    }

    const fullName = `${formData.firstName} ${formData.lastName}`.trim() || email.split('@')[0]

    try {
      const remoteAccount = await registerRemoteAccount({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email,
        password: formData.password,
      })

      if (remoteAccount.ok) {
        setCurrentUser(remoteAccount.displayName)
        addNotification('Account created', `Welcome, ${remoteAccount.displayName}.`, 'success', '/')
        navigate('/')
        return
      }

      if (remoteAccount.error !== 'not_configured') {
        const statusMessage = remoteAccount.status ? ` (HTTP ${remoteAccount.status})` : ''
        const detailSuffix = remoteAccount.details ? ` ${remoteAccount.details}` : ''
        addNotification(
          'Registration failed',
          `${remoteAccount.message || 'Unable to create an account right now.'}${statusMessage}.${detailSuffix}`.trim(),
          'warning',
        )
        return
      }

      const localAccount = await registerLocalAccount({
        email,
        password: formData.password,
        displayName: fullName,
      })

      if (!localAccount.ok) {
        if (localAccount.code === 'ACCOUNT_EXISTS' || localAccount.reason === 'exists') {
          addNotification(
            'Account already exists',
            'A local account with this email already exists. Please sign in instead.',
            'warning',
            '/login',
          )
          navigate('/login')
          return
        }

        addNotification(
          'Registration failed',
          `Unable to create local account${localAccount.code ? ` (${localAccount.code})` : ''}. Please try again.`,
          'warning',
        )
        return
      }

      setCurrentUser(localAccount.displayName)
      addNotification(
        'Local account created',
        `Profile created for ${localAccount.displayName}. Cloud auth is not configured in this deployment.`,
        'info',
        '/',
      )
      navigate('/')
    } catch {
      addNotification('Registration failed', 'Unable to create an account right now.', 'warning')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join Project Titan today</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              onChange={(event) => setFormData({ ...formData, firstName: event.target.value })}
              placeholder="Enter your first name"
              type="text"
              value={formData.firstName}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              onChange={(event) => setFormData({ ...formData, lastName: event.target.value })}
              placeholder="Enter your last name"
              type="text"
              value={formData.lastName}
            />
          </div>
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
              placeholder="Create a password"
              type="password"
              value={formData.password}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })}
              placeholder="Re-enter password"
              type="password"
              value={formData.confirmPassword}
            />
          </div>
          <button className="auth-btn" type="submit">
            Create Account
          </button>
        </form>
      </div>
    </div>
  )
}
