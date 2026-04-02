const CACHE_VERSION = 'titan-pwa-v3' // bump for new best practices
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`
const OFFLINE_FALLBACK_PAGE = '/index.html'
const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons.svg',
  '/apple-touch-icon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/maskable-icon-512x512.png',
]
const FONT_ORIGINS = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_ASSETS)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((key) => ![APP_SHELL_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key)),
      )
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') {
    return
  }

  const url = new URL(request.url)
  const isSameOrigin = url.origin === self.location.origin
  const isExternalFontRequest = FONT_ORIGINS.includes(url.origin)

  if (request.mode === 'navigate') {
    event.respondWith(
      handleNavigationRequest(request).catch(async () => {
        // Fallback to offline shell if navigation fails
        const appShellCache = await caches.open(APP_SHELL_CACHE)
        return (
          (await appShellCache.match('/index.html')) ??
          (await appShellCache.match('/')) ??
          Response.error()
        )
      })
    )
    return
  }

  if (
    isSameOrigin &&
    ['document', 'script', 'style', 'image', 'font'].includes(request.destination)
  ) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE))
    return
  }

  if (isExternalFontRequest) {
    event.respondWith(staleWhileRevalidate(request, `${RUNTIME_CACHE}-fonts`))
  }
})

async function handleNavigationRequest(request) {
  const runtimeCache = await caches.open(RUNTIME_CACHE)

  try {
    const response = await fetch(request)
    runtimeCache.put(request, response.clone())
    return response
  } catch {
    const cachedResponse = await runtimeCache.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    const appShellCache = await caches.open(APP_SHELL_CACHE)
    return (
      (await appShellCache.match('/index.html')) ??
      (await appShellCache.match('/')) ??
      Response.error()
    )
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok || response.type === 'opaque') {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => undefined)

  if (cached) {
    void networkPromise
    return cached
  }

  const networkResponse = await networkPromise

  if (networkResponse) {
    return networkResponse
  }

  return Response.error()
}
