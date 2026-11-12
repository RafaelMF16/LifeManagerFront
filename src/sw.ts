/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { notificationUrl, readPushPayload } from './shared/utils/pushPayload'
import { isAppNavigation } from './shared/utils/pwaRoutes'

declare const self: ServiceWorkerGlobalScope

/*
 * The app's service worker (vite-plugin-pwa, `injectManifest`). It keeps the shell (index.html, the built JS/CSS and
 * the icons) so the installed app opens fast, and nothing else:
 * - No route matches the API, so the SW never answers it: those requests go straight from the page to the network,
 *   no cache, no SW in between. Financial data isn't stored on the device; the refresh token stays in its cookie.
 * - Requests to other origins (Google Fonts) aren't answered either: the browser fetches them as before. The SW
 *   inherits the page's CSP (`connect-src 'self'`), which would block it from fetching them anyway.
 * - A new version waits until the user taps "Update" (`UpdatePrompt` → `SKIP_WAITING`), so nothing swaps mid-form.
 * - The habit reminders (`push`, `notificationclick`) show the backend's notification and open the app on a tap.
 */

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Any screen of the app (a deep link, the installed app's start_url, a shortcut) opens from the cached index.html;
// `isAppNavigation` (tested) keeps the API, files and other origins out.
const appShell = createHandlerBoundToURL('index.html')
registerRoute(({ request, url }) => request.mode === 'navigate' && isAppNavigation(url, self.location.origin), appShell)

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting()
})

// A habit reminder from the backend. Every push must show a notification (`userVisibleOnly`), so a payload that can't
// be read still shows a generic one.
self.addEventListener('push', (event) => {
  let data: unknown = null
  try {
    data = event.data?.json()
  } catch {
    data = null
  }
  const payload = readPushPayload(data)

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-96.png',
      data: { url: payload.url },
    }),
  )
})

// A tap focuses an open window of the app and takes it to the notification's screen, or opens a new one.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = notificationUrl(String(event.notification.data?.url ?? ''), self.location.origin)

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const open = windows.find((client) => new URL(client.url).origin === self.location.origin)

      if (!open) {
        await self.clients.openWindow(target)
        return
      }

      const focused = await open.focus()
      if (focused.url !== target) await focused.navigate(target).catch(() => self.clients.openWindow(target))
    })(),
  )
})
