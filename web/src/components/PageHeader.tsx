import { m, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

type PageHeaderProps = {
  eyebrow: string
  title: string
  description: string
  action?: ReactNode
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <m.header
      className="page-header"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <m.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.26, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </m.div>
      {action ? <div className="page-action">{action}</div> : null}
    </m.header>
  )
}
