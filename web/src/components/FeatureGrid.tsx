import { memo } from 'react'
import { Link } from 'react-router-dom'

export const FeatureGrid = memo(() => {
  return (
    <>
      <Link className="feature-tile" to="/sms">
        <span>SMS</span>
        <strong>Track UPI spending alerts</strong>
      </Link>
      <Link className="feature-tile" to="/cash">
        <span>Cash</span>
        <strong>Track your daily expenses</strong>
      </Link>
      <Link className="feature-tile" to="/emis">
        <span>EMI</span>
        <strong>Manage monthly budget load</strong>
      </Link>
      <Link className="feature-tile" to="/rent">
        <span>Rent</span>
        <strong>Plan shared monthly expenses</strong>
      </Link>
      <Link className="feature-tile" to="/groups">
        <span>Groups</span>
        <strong>Split expenses with friends</strong>
      </Link>
    </>
  )
})