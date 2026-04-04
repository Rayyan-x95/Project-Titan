import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const OFFLINE_READY_TIMEOUT_MS = 4200

function getNavigatorOnLine() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

function getStandaloneMatch() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(display-mode: standalone)').matches
    : false
}

export function PwaCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null,
  )
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const [offlineReady, setOfflineReady] = useState(false)
  const [isOnline, setIsOnline] = useState(getNavigatorOnLine)
  const [isStandalone, setIsStandalone] = useState(getStandaloneMatch)
  const [updateBannerVisible, setUpdateBannerVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }

    const standaloneMedia = window.matchMedia('(display-mode: standalone)')

    const handleOnlineStatusChange = () => setIsOnline(navigator.onLine)
    const handleStandaloneChange = (event: MediaQueryListEvent) =>
      setIsStandalone(event.matches)
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }
    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setIsStandalone(true)
    }

    window.addEventListener('online', handleOnlineStatusChange)
    window.addEventListener('offline', handleOnlineStatusChange)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    standaloneMedia.addEventListener('change', handleStandaloneChange)

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange)
      window.removeEventListener('offline', handleOnlineStatusChange)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      standaloneMedia.removeEventListener('change', handleStandaloneChange)
    }
  }, [])

  useEffect(() => {
    if (
      typeof navigator === 'undefined' ||
      !import.meta.env.PROD ||
      !('serviceWorker' in navigator)
    ) {
      return
    }

    let isMounted = true
    let offlineReadyTimer: number | undefined

    const registerServiceWorker = async () => {
      const registration = await navigator.serviceWorker.register('/sw.js')

      const syncManager = (registration as ServiceWorkerRegistration & {
        sync?: { register: (tag: string) => Promise<void> }
      }).sync

      if (syncManager) {
        try {
          await syncManager.register('titan-sync-queue')
        } catch {
          // Sync may fail on unsupported/privacy-restricted browsers.
        }
      }

      const trackWorker = (worker: ServiceWorker | null) => {
        if (!worker) {
          return
        }

        worker.addEventListener('statechange', () => {
          if (!isMounted || worker.state !== 'installed') {
            return
          }

          if (navigator.serviceWorker.controller) {
            setWaitingWorker(worker)
            setUpdateBannerVisible(true)
            return
          }

          setOfflineReady(true)
          offlineReadyTimer = window.setTimeout(() => {
            if (isMounted) {
              setOfflineReady(false)
            }
          }, OFFLINE_READY_TIMEOUT_MS)
        })
      }

      if (registration.waiting) {
        setWaitingWorker(registration.waiting)
        setUpdateBannerVisible(true)
      }

      trackWorker(registration.installing)
      registration.addEventListener('updatefound', () => {
        trackWorker(registration.installing)
      })
    }

    void registerServiceWorker()

    return () => {
      isMounted = false
      if (offlineReadyTimer) {
        window.clearTimeout(offlineReadyTimer)
      }
    }
  }, [])

  if (!import.meta.env.PROD) {
    return null
  }

  const showInstallAction = Boolean(deferredPrompt) && !isStandalone
  const showUpdateAction = Boolean(waitingWorker)

  async function handleInstall() {
    if (!deferredPrompt) {
      return
    }

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  function handleUpdate() {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' })
    setUpdateBannerVisible(false)
    window.location.reload()
  }

  return (
    <section className="sidebar-panel pwa-card" aria-live="polite">
      {updateBannerVisible ? (
        <div className="update-banner" role="status" aria-live="polite">
          <span>Update available</span>
          <button className="button button-primary button-small" onClick={handleUpdate} type="button">
            Refresh now
          </button>
        </div>
      ) : null}
      <div className="pwa-card-head">
        <p className="eyebrow">PWA mode</p>
        <span
          className={`pwa-pill ${
            isOnline ? 'pwa-pill-online' : 'pwa-pill-offline'
          }`}
        >
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      <h3>
        {showUpdateAction
          ? 'Update ready'
          : offlineReady
            ? 'Offline-ready shell'
            : isStandalone
              ? 'Installed app mode'
              : 'Install Titan'}
      </h3>

      <p className="brand-copy">
        {showUpdateAction
          ? 'A fresher build is waiting. Reload into the latest cached shell when you are ready.'
          : offlineReady
            ? 'Titan has cached its core shell so your saved ledger keeps opening even when your connection drops.'
            : isStandalone
              ? 'Titan is running like an app and will reuse cached screens after the first successful load.'
              : 'Add Titan to your home screen for a standalone finance workspace with faster relaunches and offline access after first load.'}
      </p>

      <div className="button-row">
        {showInstallAction ? (
          <button className="button button-primary" onClick={handleInstall} type="button">
            Install app
          </button>
        ) : null}

        {showUpdateAction ? (
          <button className="button button-primary" onClick={handleUpdate} type="button">
            Refresh app
          </button>
        ) : null}

        {!showInstallAction && !showUpdateAction ? (
          <span className="pwa-note">
            {isStandalone
              ? 'Standalone launch is active.'
              : 'If install is unavailable, use your browser menu and choose Install or Add to Home Screen.'}
          </span>
        ) : null}
      </div>
    </section>
  )
}
