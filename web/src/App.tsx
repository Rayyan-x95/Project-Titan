import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import { ErrorBoundary } from './components/ErrorBoundary'
import { TitanProvider } from './state/TitanStore'
import { AddExpensePage } from './pages/AddExpensePage'
import { AddGroupPage } from './pages/AddGroupPage'
import { CashPage } from './pages/CashPage'
import { EmiPage } from './pages/EmiPage'
import { GroupDetailPage } from './pages/GroupDetailPage'
import { GroupsPage } from './pages/GroupsPage'
import { HistoryPage } from './pages/HistoryPage'
import HomePage from './pages/HomePage'
import { HealthPage, PatternsPage, TriggersPage } from './pages/InsightDetailPages'
import { InsightsPage } from './pages/InsightsPage'
import { PersonPage } from './pages/PersonPage'
import { RentPage } from './pages/RentPage'
import { SettlementPage } from './pages/SettlementPage'
import { SmsPage } from './pages/SmsPage'

function App() {
  return (
    <ErrorBoundary>
      <TitanProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />} path="/">
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
        </BrowserRouter>
      </TitanProvider>
    </ErrorBoundary>
  )
}

export default App
