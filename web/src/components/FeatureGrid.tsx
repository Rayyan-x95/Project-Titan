import { memo } from 'react'
import { Link } from 'react-router-dom'

export const FeatureGrid = memo(() => {
  return (
    <>
      <Link className="feature-tile" to="/sms">
        <span>SMS</span>
        <strong>Review detected alerts</strong>
      </Link>
      <Link className="feature-tile" to="/cash">
        <span>Cash</span>
        <strong>Track in-hand flow</strong>
      </Link>
      <Link className="feature-tile" to="/emis">
        <span>EMI</span>
        <strong>Watch monthly load</strong>
      </Link>
      <Link className="feature-tile" to="/rent">
        <span>Rent</span>
        <strong>Trigger monthly cycles</strong>
      </Link>
      <Link className="feature-tile" to="/groups">
        <span>Groups</span>
        <strong>Balance shared spaces</strong>
      </Link>
    </>
  )
})