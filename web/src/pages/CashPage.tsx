import { motion } from 'framer-motion'
import { useTitan } from '../state/useTitan'
import { formatRupees } from '../lib/finance'

export default function CashPage() {
  const { state } = useTitan()
  
  // Calculate total cash balance
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
      <div className="metadata text-center" style={{ marginTop: '2rem', marginBottom: '1rem' }}>THE ARSENAL</div>

      <div className="flex-col" style={{ perspective: 1000, marginTop: '2rem' }}>
        <motion.div
             initial={{ y: 50, scale: 0.9, opacity: 0 }}
             animate={{ y: 0, scale: 1, opacity: 1 }}
             transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
             className="glass-surface-3 flex-col justify-between"
             style={{ 
               padding: '32px', 
               height: '240px', 
               position: 'relative',
               zIndex: 10,
               boxShadow: '0 -20px 60px rgba(0,0,0,0.4)',
               backgroundImage: 'linear-gradient(135deg, rgba(175, 162, 255, 0.08) 0%, rgba(20, 25, 39, 0) 100%)',
               borderTop: 'none'
             }}
           >
             <div className="flex-row justify-between">
               <div className="display-font" style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary)' }}>
                 TOTAL WEALTH
               </div>
             </div>
             <div className="flex-col">
               <div className="display-font" style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                 {formatRupees(totalBalance)}
               </div>
             </div>
           </motion.div>
      </div>
    </motion.div>
  )
}
