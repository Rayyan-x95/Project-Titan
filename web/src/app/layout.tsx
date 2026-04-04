import { Layout } from './layout'
import './index.css'

export const Layout = () => {
  const [isDark, setIsDark] = useDarkMode()

  return (
    <Layout>
      <div
        className="page"
        style={{
          background: isDark ? '#1a1a2e' : '#f5f5f5',
          minHeight: '100vh',
          color: isDark ? '#fff' : '#333',
        }}
      >
        <div className="app-wrapper">
          <Header />
          <main className="main-content">
            <Content />
          </main>
          <Footer />
        </div>
        <Notifications />
      </div>
    </Layout>
  )
}

const Content = () => {
  return <div className="app">
    <Header />
    <main className="main-content">
      <Content />
    </main>
    <Footer />
  </div>
}

const Header = () => {
  return (
    <header className="header">
      <Logo />
      <Nav />
    </header>
  )
}

const Logo = () => {
  return (
    <div className="logo">
      <span className="logo-text">Project Titan</span>
    </div>
  )
}

const Nav = () => {
  return (
    <nav className="nav">
      <a href="/" className="nav-link">Home</a>
      <a href="/dashboard" className="nav-link">Dashboard</a>
      <a href="/settings" className="nav-link">Settings</a>
    </nav>
  )
}

const Footer = () => {
  return (
    <footer className="footer">
      <p>Project Titan 2024</p>
    </footer>
  )
}

export default Layout
