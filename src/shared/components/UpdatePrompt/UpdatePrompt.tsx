import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useToast } from '../../hooks/useToast'

/**
 * Registers the service worker (production builds only) and, when a new version is waiting, shows a toast that
 * stays until "Update" activates it and reloads the page. Renders nothing itself.
 * Not imported by any test: `virtual:` modules only exist inside the Vite build.
 */
export default function UpdatePrompt() {
  const { t: translate } = useTranslation('common')
  const { show } = useToast()
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

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
