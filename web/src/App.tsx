import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { GoogleAnalytics } from './components/GoogleAnalytics'
import { AppShell } from './components/layouts/AppShell'
import { NotFound } from './components/not-found'
import { CurrencyProvider } from './features/currency/components/CurrencyProvider'
import { AddExpensePage } from './pages/AddExpensePage'
import { AddGroupPage } from './pages/AddGroupPage'
import { BudgetPage } from './pages/BudgetPage'
import CashPage from './pages/CashPage'
import { EmiPage } from './pages/EmiPage'
import { GroupDetailPage } from './pages/GroupDetailPage'
import { GroupsPage } from './pages/GroupsPage'
import HistoryPage from './pages/HistoryPage'
import HomePage from './pages/HomePage'
import { HealthPage, PatternsPage, TriggersPage } from './pages/InsightDetailPages'
import InsightsPage from './pages/InsightsPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { PersonPage } from './pages/PersonPage'
import { ProfilePage } from './pages/ProfilePage'
import { RentPage } from './pages/RentPage'
import {
  BudgetAppForStudentsPage,
  ExpenseTrackerIndiaPage,
  SplitExpenseAppIndiaPage,
} from './pages/SeoLandingPages'
import { SettlementPage } from './pages/SettlementPage'
import { SmsPage } from './pages/SmsPage'
import { TitanProvider } from './state/TitanStore'
import LoginPage from './app/login/page'
import RegistrationPage from './app/register/page'

export default function App() {
  return (
    <ErrorBoundary>
      <TitanProvider>
        <CurrencyProvider>
          <GoogleAnalytics />
          <BrowserRouter>
            <Routes>
              <Route element={<AppShell />}>
                <Route index element={<HomePage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="groups" element={<GroupsPage />} />
                <Route path="groups/new" element={<AddGroupPage />} />
                <Route path="groups/:groupId" element={<GroupDetailPage />} />
                <Route path="budget" element={<BudgetPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="expense/new" element={<AddExpensePage />} />
                <Route path="cash" element={<CashPage />} />
                <Route path="emis" element={<EmiPage />} />
                <Route path="rent" element={<RentPage />} />
                <Route path="sms" element={<SmsPage />} />
                <Route path="insights" element={<InsightsPage />} />
                <Route path="insights/patterns" element={<PatternsPage />} />
                <Route path="insights/triggers" element={<TriggersPage />} />
                <Route path="insights/health" element={<HealthPage />} />
                <Route path="people/:personId" element={<PersonPage />} />
                <Route path="settlements/:splitId" element={<SettlementPage />} />
                <Route path="expense-tracker-india" element={<ExpenseTrackerIndiaPage />} />
                <Route path="budget-app-for-students" element={<BudgetAppForStudentsPage />} />
                <Route path="split-expense-app-india" element={<SplitExpenseAppIndiaPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegistrationPage />} />
                <Route path="dashboard" element={<Navigate replace to="/" />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CurrencyProvider>
      </TitanProvider>
    </ErrorBoundary>
  )
}
