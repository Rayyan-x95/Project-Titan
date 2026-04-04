import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion'
import AppShell from './components/AppShell'
import { ErrorBoundary } from './components/ErrorBoundary'
import { GoogleAnalytics } from './components/GoogleAnalytics'
import { CurrencyProvider } from './features/currency/components/CurrencyProvider'
import { TitanProvider } from './state/TitanStore'

const HomePage = lazy(() => import('./pages/HomePage'))
const AddExpensePage = lazy(() => import('./pages/AddExpensePage').then((module) => ({ default: module.AddExpensePage })))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const PersonPage = lazy(() => import('./pages/PersonPage').then((module) => ({ default: module.PersonPage })))
const SettlementPage = lazy(() => import('./pages/SettlementPage').then((module) => ({ default: module.SettlementPage })))
const GroupsPage = lazy(() => import('./pages/GroupsPage').then((module) => ({ default: module.GroupsPage })))
const AddGroupPage = lazy(() => import('./pages/AddGroupPage').then((module) => ({ default: module.AddGroupPage })))
const GroupDetailPage = lazy(() => import('./pages/GroupDetailPage').then((module) => ({ default: module.GroupDetailPage })))
const SmsPage = lazy(() => import('./pages/SmsPage').then((module) => ({ default: module.SmsPage })))
const CashPage = lazy(() => import('./pages/CashPage'))
const EmiPage = lazy(() => import('./pages/EmiPage').then((module) => ({ default: module.EmiPage })))
const RentPage = lazy(() => import('./pages/RentPage').then((module) => ({ default: module.RentPage })))
const InsightsPage = lazy(() => import('./pages/InsightsPage'))
const PatternsPage = lazy(() => import('./pages/InsightDetailPages').then((module) => ({ default: module.PatternsPage })))
const TriggersPage = lazy(() => import('./pages/InsightDetailPages').then((module) => ({ default: module.TriggersPage })))
const HealthPage = lazy(() => import('./pages/InsightDetailPages').then((module) => ({ default: module.HealthPage })))
const ExpenseTrackerIndiaPage = lazy(() => import('./pages/SeoLandingPages').then((module) => ({ default: module.ExpenseTrackerIndiaPage })))
const BudgetAppForStudentsPage = lazy(() => import('./pages/SeoLandingPages').then((module) => ({ default: module.BudgetAppForStudentsPage })))
const SplitExpenseAppIndiaPage = lazy(() => import('./pages/SeoLandingPages').then((module) => ({ default: module.SplitExpenseAppIndiaPage })))

function RouteSuspense({ children, kind }: { children: ReactNode; kind: 'dashboard' | 'form' | 'list' | 'insight' }) {
  const rowsByKind: Record<'dashboard' | 'form' | 'list' | 'insight', string[]> = {
    dashboard: ['lg', 'md', 'sm'],
    form: ['lg', 'md', 'md', 'sm'],
    list: ['md', 'md', 'md', 'md'],
    insight: ['lg', 'lg', 'md', 'md'],
  }

  return (
    <Suspense
      fallback={
        <section className="glass-panel route-skeleton" aria-live="polite" aria-busy="true">
          <p className="eyebrow">Loading</p>
          <div className="skeleton-stack" aria-hidden="true">
            {rowsByKind[kind].map((row, index) => (
              <span key={`${row}-${index}`} className={`skeleton-line skeleton-line-${row}`} />
            ))}
          </div>
        </section>
      }
    >
      {children}
    </Suspense>
  )
}

function SplashScreen() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <m.div
      className="splash-overlay"
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: [0.2, 0.8, 0.2, 1] }}
      role="status"
      aria-live="polite"
      aria-label="Titan is starting"
    >
      <m.div
        className="splash-card glass-panel"
        initial={shouldReduceMotion ? false : { scale: 0.96, y: 10 }}
        animate={shouldReduceMotion ? { scale: 1 } : { scale: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.48, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div className="splash-mark-wrap">
          <m.img
            className="splash-mark"
            src="/titan_logo_icon_transparent.png"
            alt="Titan logo"
            initial={shouldReduceMotion ? false : { scale: 0.88, opacity: 0.7 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.38, ease: [0.2, 0.8, 0.2, 1] }}
          />
          <div className="splash-ring" aria-hidden="true" />
        </div>
        <div>
          <p className="eyebrow">Titan</p>
          <h1 className="splash-title">Expense mode on</h1>
          <p className="splash-copy">Fast tracking. Offline ready. Shared by default.</p>
        </div>
      </m.div>
    </m.div>
  )
}

function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1250)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <ErrorBoundary>
      <TitanProvider>
        <CurrencyProvider>
          <LazyMotion features={domAnimation}>
            <BrowserRouter>
              <Routes>
                <Route element={<AppShell />} path="/">
                  <Route element={<RouteSuspense kind="dashboard"><HomePage /></RouteSuspense>} index />
                  <Route element={<RouteSuspense kind="form"><AddExpensePage /></RouteSuspense>} path="expense/new" />
                  <Route element={<RouteSuspense kind="list"><HistoryPage /></RouteSuspense>} path="history" />
                  <Route element={<RouteSuspense kind="list"><PersonPage /></RouteSuspense>} path="people/:personId" />
                  <Route element={<RouteSuspense kind="form"><SettlementPage /></RouteSuspense>} path="settlements/:splitId" />
                  <Route element={<RouteSuspense kind="list"><GroupsPage /></RouteSuspense>} path="groups" />
                  <Route element={<RouteSuspense kind="form"><AddGroupPage /></RouteSuspense>} path="groups/new" />
                  <Route element={<RouteSuspense kind="list"><GroupDetailPage /></RouteSuspense>} path="groups/:groupId" />
                  <Route element={<RouteSuspense kind="form"><SmsPage /></RouteSuspense>} path="sms" />
                  <Route element={<RouteSuspense kind="form"><CashPage /></RouteSuspense>} path="cash" />
                  <Route element={<RouteSuspense kind="form"><EmiPage /></RouteSuspense>} path="emis" />
                  <Route element={<RouteSuspense kind="form"><RentPage /></RouteSuspense>} path="rent" />
                  <Route element={<RouteSuspense kind="insight"><InsightsPage /></RouteSuspense>} path="insights" />
                  <Route element={<RouteSuspense kind="insight"><PatternsPage /></RouteSuspense>} path="insights/patterns" />
                  <Route element={<RouteSuspense kind="insight"><TriggersPage /></RouteSuspense>} path="insights/triggers" />
                  <Route element={<RouteSuspense kind="insight"><HealthPage /></RouteSuspense>} path="insights/health" />
                  <Route element={<RouteSuspense kind="list"><ExpenseTrackerIndiaPage /></RouteSuspense>} path="expense-tracker-india" />
                  <Route element={<RouteSuspense kind="list"><BudgetAppForStudentsPage /></RouteSuspense>} path="budget-app-for-students" />
                  <Route element={<RouteSuspense kind="list"><SplitExpenseAppIndiaPage /></RouteSuspense>} path="split-expense-app-india" />
                  <Route element={<Navigate replace to="/" />} path="*" />
                </Route>
              </Routes>
              <GoogleAnalytics />
            </BrowserRouter>
          </LazyMotion>
          <AnimatePresence>
            {showSplash ? <SplashScreen key="splash" /> : null}
          </AnimatePresence>
        </CurrencyProvider>
      </TitanProvider>
    </ErrorBoundary>
  )
}

export default App

