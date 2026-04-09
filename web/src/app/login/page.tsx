import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTitan } from '../../state/titan-context'

export default function LoginPage() {
  const navigate = useNavigate()
  const { addNotification, setCurrentUser } = useTitan()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const fallbackName = formData.email.split('@')[0]?.trim() || 'Titan User'
    setCurrentUser(fallbackName)
    addNotification('Welcome back', `Signed in as ${fallbackName}.`, 'success', '/')
    navigate('/')
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
