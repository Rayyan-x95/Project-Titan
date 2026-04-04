const CACHE_VERSION = 'titan-pwa-v9'
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`
const NAVIGATION_CACHE = `${CACHE_VERSION}-navigation`
const API_CACHE = `${CACHE_VERSION}-api`
const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/titan_logo_icon_transparent.png',
  '/titan_logo_full_transparent.png',
  '/titan-icon-180.png',
  '/titan-icon-192.png',
  '/titan-icon-512.png',
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
          .filter((key) => ![APP_SHELL_CACHE, RUNTIME_CACHE, NAVIGATION_CACHE].includes(key))
          .map((key) => caches.delete(key)),
      )
      if ('navigationPreload' in self.registration) {
        await self.registration.navigationPreload.enable()
      }
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
  const shouldCacheNavigation = url.search.length === 0

    // Always bypass service worker for SEO files (let network serve them)
    if (url.pathname === '/sitemap.xml' || url.pathname === '/robots.txt') {
      return
    }

  const isSameOrigin = url.origin === self.location.origin
  const isExternalFontRequest = FONT_ORIGINS.includes(url.origin)

  if (request.mode === 'navigate') {
    event.respondWith(
      handleNavigationRequest(event, request, shouldCacheNavigation).catch(async () => {
        const appShellCache = await caches.open(APP_SHELL_CACHE)
        return (
          (shouldCacheNavigation ? await (await caches.open(NAVIGATION_CACHE)).match(request) : null) ??
          (await appShellCache.match('/offline.html')) ??
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

  if (url.pathname.startsWith('/api/') || url.hostname.includes('er-api.com')) {
    event.respondWith(networkFirst(request, API_CACHE))
    return
  }

  if (isExternalFontRequest) {
    event.respondWith(staleWhileRevalidate(request, `${RUNTIME_CACHE}-fonts`))
  }
})

self.addEventListener('sync', (event) => {
  if (event.tag !== 'titan-sync-queue') {
    return
  }

  event.waitUntil(
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: 'SYNC_QUEUE' })
      })
    }),
  )
})

async function handleNavigationRequest(event, request, shouldCacheNavigation = true) {
  const runtimeCache = shouldCacheNavigation ? await caches.open(NAVIGATION_CACHE) : null

  const preloadResponse = await event.preloadResponse

  if (preloadResponse) {
    if (runtimeCache) {
      runtimeCache.put(request, preloadResponse.clone())
    }
    return preloadResponse
  }

  try {
    const response = await fetch(request)
    if (runtimeCache) {
      runtimeCache.put(request, response.clone())
    }
    return response
  } catch {
    const cachedResponse = runtimeCache ? await runtimeCache.match(request) : null

    if (cachedResponse) {
      return cachedResponse
    }

    const appShellCache = await caches.open(APP_SHELL_CACHE)
    return (
      (await appShellCache.match('/offline.html')) ??
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

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)

  try {
    const response = await fetch(request)
    if (response.ok || response.type === 'opaque') {
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cachedResponse = await cache.match(request)
    return cachedResponse ?? Response.error()
  }
}
