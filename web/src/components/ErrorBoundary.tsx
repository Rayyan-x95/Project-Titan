import React from 'react'
import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught error:', error, errorInfo)
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      const { error } = this.state
      if (this.props.onError) {
        return (
          <div className="error-boundary">
            <h2>Error</h2>
            <p>Something went wrong. Please try again.</p>
          </div>
        )
      }
      return (
        <div className="error-boundary">
          <h2>Error</h2>
          <p className="error-message">{error?.message}</p>
          <Link to="/" className="back-link">
            Go Home
          </Link>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
