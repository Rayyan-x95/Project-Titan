import type { ReactNode } from 'react'
import { useDarkMode } from '../lib/utils'

type LayoutProps = {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { isDark } = useDarkMode()

  return (
    <div className={`page app-layout ${isDark ? 'app-layout-dark' : 'app-layout-light'}`}>
      <div className="app-wrapper">{children}</div>
    </div>
  )
}

export default Layout
