import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useToast } from '../../hooks/useToast'
import { shouldCheckForUpdate, UPDATE_CHECK_INTERVAL_MS } from '../../utils/swUpdateCheck'

/**
 * Asks the browser to look for a new `sw.js` every hour and when the tab is shown again (at most every few minutes):
 * an installed app left open never reloads, and the browser only checks on a page load.
 */
function watchForUpdates(registration: ServiceWorkerRegistration) {
  let lastCheckAt: number | null = Date.now()

  function check() {
    const now = Date.now()
    if (!shouldCheckForUpdate({ lastCheckAt, now, online: navigator.onLine })) return
    lastCheckAt = now
    // A failed check (offline, server error) just waits for the next one.
    registration.update().catch(() => undefined)
  }

  setInterval(check, UPDATE_CHECK_INTERVAL_MS)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check()
  })
}

/**
 * Registers the service worker (production builds only) and, when a new version is waiting, shows a toast that
 * stays until "Update" activates it and reloads the page (a timed toast may cover it for a moment; it comes back).
 * Renders nothing itself. Not imported by any test: `virtual:` modules only exist inside the Vite build.
 */
export default function UpdatePrompt() {
  const { t: translate } = useTranslation('common')
  const { show } = useToast()
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW: (_url, registration) => {
      if (registration) watchForUpdates(registration)
    },
  })

  useEffect(() => {
    if (!needRefresh) return
    show(
      translate('update.available'),
      undefined,
      { label: translate('update.action'), onClick: () => void updateServiceWorker(true) },
      { persistent: true },
    )
  }, [needRefresh, show, translate, updateServiceWorker])

  return null
}
