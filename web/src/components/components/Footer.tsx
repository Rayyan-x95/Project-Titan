import { useTitan } from '../../state/titan-context'

function Footer() {
  const { isDark } = useDarkMode()

  return (
    <footer
      className={`footer ${isDark ? 'dark' : ''}`}
      style={{
        background: isDark ? '#16213e' : '#f5f5f5',
        borderTop: '1px solid',
        borderColor: isDark ? '#2a2a3e' : '#e0e0e0'
      }}
    >
      <div className="footer-content">
        <p>&copy; 2024 Project Titan. All rights reserved.</p>
      </div>
    </footer>
  )
}

export { Footer }
