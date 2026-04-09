import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <div className="not-found-icon">
          <span className="icon" aria-hidden="true">
            404
          </span>
        </div>
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist in this Titan build.</p>
        <p>
          Try the <Link to="/">home dashboard</Link>, <Link to="/groups">groups</Link>, or{' '}
          <Link to="/history">history</Link>.
        </p>
        <Link className="back-link" to="/">
          Back to home
        </Link>
      </div>
    </div>
  )
}
