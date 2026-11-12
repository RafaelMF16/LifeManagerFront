import { useCallback, useEffect, useRef, useState } from 'react'
import { disablePush, enablePush, readPushState } from '../../shared/services/pushService'
import type { PushSupportState } from '../../shared/utils/pushSupport'

/**
 * This device's habit reminders for the Notifications section: the state (`null` while it's read), re-read when the
 * tab comes back (the user may have changed the permission in the browser's settings), and the two actions. Errors
 * reject for the caller to show; the state is read again afterwards either way.
 */
export function usePushNotifications() {
  const [state, setState] = useState<PushSupportState | null>(null)
  const [busy, setBusy] = useState(false)
  const mountedRef = useRef(true)

  const refresh = useCallback(async () => {
    const next = await readPushState().catch((): PushSupportState => 'unsupported')
    if (mountedRef.current) setState(next)
  }, [])

  useEffect(() => {
    mountedRef.current = true
    void refresh()

    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      mountedRef.current = false
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refresh])

  const run = useCallback(
    async <T>(action: () => Promise<T>): Promise<T> => {
      setBusy(true)
      try {
        return await action()
      } finally {
        await refresh()
        if (mountedRef.current) setBusy(false)
      }
    },
    [refresh],
  )

  const enable = useCallback(() => run(enablePush), [run])
  const disable = useCallback(() => run(disablePush), [run])

  return { state, busy, enable, disable }
}
