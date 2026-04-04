// App.tsx - Main Application Entry Point
// Project Titan Modern UI Implementation

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layouts/AppShell'
import { DashboardLayout } from './components/layouts/DashboardLayout'
import { Notifications } from './components/notifications'
import { NotFound } from './components/not-found'
import { PwaCard } from './components/PwaCard'
import { OfflineIndicator } from './components/organisms/OfflineIndicator'
import { useTitan } from './state/titan-context'

// Layout Components
const ErrorBoundary = (
  <ErrorBoundary
    onError={console.error}
    fallback={<Navigate to="/dashboard" replace />}
  />
)

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useTitan()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <ErrorBoundary>{children}</ErrorBoundary>
}

// Main App Component
const App = () => {
  const { notifications } = useTitan()

  return (
    <BrowserRouter>
      <NotificationsContext.Provider>
        <Routes>
          <Route path="/" element={<AppShell />} />
          <Route path="/dashboard" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
          <Route path="/projects/my" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </NotificationsContext.Provider>
      <div className="app">
        <PwaCard />
        <OfflineIndicator show={notifications.length > 0} />
      </div>
    </BrowserRouter>
  )
}

export default App
