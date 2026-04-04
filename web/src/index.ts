// Project Titan - Entry Points
// Re-export all main files for clean imports

// Components
export { default as Header } from './components/components/Header'
export { default as Footer } from './components/components/Footer'
export { default as Navbar } from './components/components/Navbar'
export { default as CurrencyToolbar } from './components/components/CurrencyToolbar'

export { default as ProjectCard } from './components/molecules/ProjectCard'
export { CollaborationModal } from './components/organisms/CollaborationModal'
export { OfflineIndicator } from './components/organisms/OfflineIndicator'
export { NotificationBadge } from './components/organisms/NotificationBadge'
export { OfflineStatusBar } from './components/components/OfflineStatusBar'
export { PwaCard } from './components/PwaCard'

export { useDarkMode } from './lib/utils'
export { useTitan } from './state/titan-context'

// Layouts
export { AppShell } from './components/layouts/AppShell'
export { DashboardLayout } from './components/layouts/DashboardLayout'

// Public Components
export { NotFound } from './components/not-found'
export { Notifications } from './components/notifications'
export { ErrorBoundary } from './components/ErrorBoundary'

// Styles
export * from './index.css'

// Utilities
export * from './lib/utils'

// Main App
export { App } from './App'
