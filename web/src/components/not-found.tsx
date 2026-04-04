import { Link, useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="not-found">
      <div className="not-found-content">
        <div className="not-found-icon">
          <span className="icon">🚫</span>
        </div>
        <h1>404 - Page Not Found</h1>
        <p>
          The page you're looking for doesn't exist.
        </p>
        <p>
          Did you mean <Link to="/dashboard">dashboard</Link> or <Link to="/projects">projects</Link>?
        </p>
        <Link
          to="/"
          className="back-link"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export { NotFound }
