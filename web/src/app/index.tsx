import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import App from '../App'
import { AppProvider } from './AppProvider'

export function mountApp(rootId = 'root'): Root {
  const rootElement = document.getElementById(rootId)

  if (!rootElement) {
    throw new Error('Root element not found')
  }

  const root = createRoot(rootElement)
  root.render(
    <AppProvider>
      <App />
    </AppProvider>,
  )

  return root
}

export default mountApp
