import * as React from 'react'

type ErrorBoundaryProps = {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error | null; resetError: () => void }>
}

type ErrorBoundaryState = {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultFallback
      return <Fallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

function DefaultFallback({ error, resetError }: { error: Error | null; resetError: () => void }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="glass-panel error-boundary-panel"
    >
      <h2 className="display-value">Something went wrong.</h2>
      <p className="hero-copy">
        We apologize for the inconvenience. Our team has been notified.
      </p>
      <div className="metric-grid">
        <div>
          <strong>{error?.message ?? 'Unknown error'}</strong>
        </div>
      </div>
      <button onClick={resetError} className="button button-primary">
        Try again
      </button>
    </div>
  )
}