/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
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
 * `habit-reminders` adds its `push` handler here.
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
