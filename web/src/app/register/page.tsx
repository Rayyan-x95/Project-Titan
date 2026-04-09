import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTitan } from '../../state/titan-context'

export default function RegistrationPage() {
  const navigate = useNavigate()
  const { addNotification, setCurrentUser } = useTitan()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      addNotification('Password mismatch', 'Please make sure both passwords match.', 'warning')
      return
    }

    const fullName =
      `${formData.firstName} ${formData.lastName}`.trim() || formData.email || 'Titan User'
    setCurrentUser(fullName)
    addNotification('Account ready', `Profile created for ${fullName}.`, 'success', '/')
    navigate('/')
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
