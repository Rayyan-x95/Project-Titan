import { motion } from 'framer-motion'
import { useTitan } from '../state/useTitan'
import { formatRupees } from '../lib/finance'

export default function InsightsPage() {
  const { state } = useTitan()
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex-col"
    >
      <div className="metadata text-center" style={{ marginTop: '2rem', marginBottom: '2rem' }}>THE PULSE</div>

      {/* The Chart Area (Edge to Edge) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ margin: '0 -24px 2rem -24px', position: 'relative', height: '240px' }}
      >
        <svg width="100%" height="100%" viewBox="0 0 500 240" preserveAspectRatio="none">
          <defs>
            <linearGradient id="growthGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--tertiary)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--tertiary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            d="M0 180 Q 50 180, 100 140 T 200 120 T 300 160 T 400 80 T 500 40 L 500 240 L 0 240 Z" 
            fill="url(#growthGlow)" 
          />
          <motion.path 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            d="M0 180 Q 50 180, 100 140 T 200 120 T 300 160 T 400 80 T 500 40" 
            fill="none" 
            stroke="var(--tertiary)" 
            strokeWidth="3" 
            strokeLinecap="round" 
          />
        </svg>

        <div style={{ position: 'absolute', top: 20, left: 24 }}>
          <div className="metadata">CURRENT ALPHA</div>
          <div className="display-font" style={{ fontSize: '2.5rem', fontWeight: 800 }}>+24.8%</div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {[
          { label: 'CASH ON HAND', val: formatRupees(state.cashEntries.reduce((a,b)=>b.type === 'IN' ? a+b.amountRupees : a-b.amountRupees,0)) },
          { label: 'ACTIVE EMIs', val: formatRupees(state.emis.filter(e => e.isActive).reduce((a,b)=>a+b.amountRupees,0)) },
          { label: '30D BURN RATE', val: formatRupees(12400) }, // Mocked for UI
          { label: 'HEALTH SCORE', val: '92/100', color: 'var(--tertiary)' },
        ].map((m, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + (i * 0.1), duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="glass-surface-1 flex-col justify-center"
            style={{ padding: '24px', height: '140px' }}
          >
            <div className="metadata" style={{ marginBottom: 8 }}>{m.label}</div>
            <div className="display-font" style={{ fontSize: '1.4rem', fontWeight: 700, color: m.color || 'var(--text-main)' }}>
              {m.val}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
