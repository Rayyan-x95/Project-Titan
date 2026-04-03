import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import AppShell from './components/AppShell'
import { ErrorBoundary } from './components/ErrorBoundary'
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

function RouteFallback() {
  return <div className="boot-screen">Loading Titan...</div>
}

function App() {
  return (
    <ErrorBoundary>
      <TitanProvider>
        <BrowserRouter>
          <Routes>
            <Route
              element={
                <Suspense fallback={<RouteFallback />}>
                  <AppShell />
                </Suspense>
              }
              path="/"
            >
              <Route element={<HomePage />} index />
              <Route element={<AddExpensePage />} path="expense/new" />
              <Route element={<HistoryPage />} path="history" />
              <Route element={<PersonPage />} path="people/:personId" />
              <Route element={<SettlementPage />} path="settlements/:splitId" />
              <Route element={<GroupsPage />} path="groups" />
              <Route element={<AddGroupPage />} path="groups/new" />
              <Route element={<GroupDetailPage />} path="groups/:groupId" />
              <Route element={<SmsPage />} path="sms" />
              <Route element={<CashPage />} path="cash" />
              <Route element={<EmiPage />} path="emis" />
              <Route element={<RentPage />} path="rent" />
              <Route element={<InsightsPage />} path="insights" />
              <Route element={<PatternsPage />} path="insights/patterns" />
              <Route element={<TriggersPage />} path="insights/triggers" />
              <Route element={<HealthPage />} path="insights/health" />
              <Route element={<Navigate replace to="/" />} path="*" />
            </Route>
          </Routes>
          <Analytics />
          <SpeedInsights />
        </BrowserRouter>
      </TitanProvider>
    </ErrorBoundary>
  )
}

export default App

