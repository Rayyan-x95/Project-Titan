import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

async function clearServiceWorkerCache() {
  if (import.meta.env.PROD || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))

    if (typeof caches !== 'undefined') {
      const cacheKeys = await caches.keys()
      await Promise.all(cacheKeys.map((key) => caches.delete(key)))
    }
  } catch {
    // Ignore cache cleanup failures in development.
  }
}

void clearServiceWorkerCache()

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

const root = createRoot(rootElement)

function showBootstrapError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  root.render(
    <div className="boot-screen boot-screen-error" role="alert">
      <div>
        <strong>App failed to start.</strong>
        <p>{message}</p>
      </div>
    </div>,
  )
}

void import('./App.tsx')
  .then(({ default: App }) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
  .catch((error) => {
    console.error(error)
    showBootstrapError(error)
  })
