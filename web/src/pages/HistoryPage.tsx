import { motion } from 'framer-motion'
import { useTitan } from '../state/useTitan'
import { formatRupees } from '../lib/finance'

export default function HistoryPage() {
  const { state } = useTitan()
  const sorted = [...state.transactions].sort((a,b) => b.timestamp - a.timestamp)
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex-col gap-8"
    >
      <div className="metadata text-center" style={{ marginTop: '2rem', marginBottom: '1rem' }}>THE LEDGER</div>

      <div className="flex-col gap-6">
        {sorted.length === 0 && <div className="text-center metadata text-muted" style={{ marginTop: '4rem' }}>NO TRANSACTIONS RECORDED</div>}
        {sorted.map((tx, i) => {
           const isIncome = tx.type === 'REFUND' || tx.type === 'INCOME' // just some logic, normally it's an expense app
           return (
             <motion.div
               key={tx.id}
               initial={{ y: 30, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
               className="flex-row justify-between"
               style={{ padding: '8px 16px', borderRadius: 16, transition: 'all 0.3s ease' }}
               whileHover={{ scale: 1.03, backgroundColor: 'var(--level-2)', boxShadow: '0 0 40px rgba(0, 207, 252, 0.05)' }}
             >
               <div className="flex-col">
                 <div style={{ fontFamily: 'Manrope', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-main)' }}>
                   {tx.merchant}
                 </div>
                 <div className="metadata" style={{ marginTop: 4 }}>
                   {tx.type} • {new Date(tx.timestamp).toLocaleDateString()}
                 </div>
               </div>
               <div className={`display-font ${isIncome ? 'text-tertiary' : 'text-muted'}`} style={{ fontWeight: 800, fontSize: '1.4rem' }}>
                 {isIncome ? '+' : ''}{formatRupees(tx.amountRupees)}
               </div>
             </motion.div>
           )
        })}
      </div>
    </motion.div>
  )
}
