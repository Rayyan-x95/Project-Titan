import { Outlet } from 'react-router-dom'
import { CurrencyToolbar } from '../../features/currency/components/CurrencyToolbar'
import { OfflineStatusBar } from '../../features/offline-sync/components/OfflineStatusBar'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { Navbar } from '../components/Navbar'
import { Notifications } from '../notifications'

export function AppShell() {
  return (
    <div className="app-shell">
      <Header />
      <Navbar />
      <OfflineStatusBar />
      <Notifications />
      <main className="app-shell-main">
        <Outlet />
      </main>
      <aside className="app-shell-aside">
        <CurrencyToolbar />
      </aside>
      <Footer />
    </div>
  )
}
