import type { ReactNode } from 'react'
import { useDarkMode } from '../lib/utils'

type LayoutProps = {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { isDark } = useDarkMode()

  return (
    <div
      className="page"
      style={{
        background: isDark ? '#1a1a2e' : '#f5f5f5',
        color: isDark ? '#fff' : '#333',
        minHeight: '100vh',
      }}
    >
      <div className="app-wrapper">{children}</div>
    </div>
  )
}

export default Layout
