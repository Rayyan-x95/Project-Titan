import { createRoot } from 'react-dom/client'
import { Provider } from './providers'
import { AppProvider } from './AppProvider'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

const root = createRoot(rootElement)

// Root Provider
const Provider = {
  // Initialize Provider
  setup() {
    root.render(
      <AppProvider>
        <Provider.Provider>
          <main>
            <div id="root">
              {/* React Root here */}
              <App />
            </div>
          </main>
        </Provider.Provider>
      </AppProvider>
    )
  },
  // Cleanup Provider (if needed)
  teardown() {},
}

export default Provider
