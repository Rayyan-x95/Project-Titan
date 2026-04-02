import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTitan } from '../state/useTitan'
import { formatRupees } from '../lib/finance'

export default function HomePage() {
  const { state } = useTitan()
  const navigate = useNavigate()
  
  // Total balance computation
  const totalBalance = state.cashEntries.reduce((acc, current) => {
    return current.type === 'IN' ? acc + current.amountRupees : acc - current.amountRupees
  }, 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex-col gap-8"
    >
      {/* Hero Apex */}
      <motion.div 
         initial={{ y: 20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
         className="flex-col justify-center text-center" 
         style={{ marginTop: '4rem', marginBottom: '2rem' }}
      >
        <div className="metadata text-center">TOTAL VAULT VALUE</div>
        <div className="hero-balance">{formatRupees(totalBalance)}</div>
      </motion.div>

      {/* Glass Action Pills */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex-row gap-4"
      >
        <button className="action-pill" onClick={() => navigate('/expense/new')}>
          <span className="action-label">ADD</span>
        </button>
        <button className="action-pill">
          <span className="action-label">SEND</span>
        </button>
        <button className="action-pill">
          <span className="action-label">EXCHANGE</span>
        </button>
      </motion.div>

      {/* Recent Pulse */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass-surface-1 flex-col gap-4"
        style={{ padding: '24px', marginTop: '1rem' }}
      >
        <div className="metadata">RECENT PULSE</div>
        <div className="flex-row justify-between">
          <div className="flex-col">
             <div style={{ fontFamily: 'Plus Jakarta Sans', fontSize: '1.1rem', fontWeight: 600 }}>System Boot</div>
             <div className="metadata" style={{ marginTop: 4 }}>Vault Initialized</div>
          </div>
          <div className="text-tertiary display-font" style={{ fontWeight: 700 }}>+ AUTH</div>
        </div>
      </motion.div>
    </motion.div>
  )
}
