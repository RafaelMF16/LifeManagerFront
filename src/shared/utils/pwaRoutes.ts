const API_PATH = /^\/api(\/|$)/i
// A path whose last segment has an extension is a file (sw.js, an icon, a chunk), never a screen of the app.
const FILE_PATH = /\/[^/]+\.[^/]+$/

/**
 * Whether the service worker answers this navigation with the app's cached `index.html` (`src/sw.ts`): only the app's
 * own screens. The API (any case, like the backend's routes), files and other origins go to the network.
 */
export function isAppNavigation(url: URL, appOrigin: string): boolean {
  return url.origin === appOrigin && !API_PATH.test(url.pathname) && !FILE_PATH.test(url.pathname)
}
