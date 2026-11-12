import { useCallback, useEffect, useRef, useState } from 'react'
import { disablePush, enablePush, readPushState } from '../../shared/services/pushService'
import type { PushStatus } from '../../shared/services/pushService'
import { isApiError } from '../../shared/types/ApiError'
import { PUSH_NOT_CONFIGURED_CODE } from '../../shared/types/PushDtos'
import type { PushSupportState } from '../../shared/utils/pushSupport'

/** What the section shows: the device's state, or `unavailable` once the server said it has no VAPID keys. */
export type NotificationsState = PushSupportState | 'unavailable'

const UNSUPPORTED: PushStatus = { state: 'unsupported', subscribed: false }

/**
 * This device's habit reminders for the Notifications section: the state (`null` while it's read) and whether the
 * signed-in account has a subscription here, re-read when the tab comes back (the user may have changed the
 * permission in the browser's settings), and the two actions. Errors reject for the caller to show, except
 * `Push.NotConfigured`, which turns the state into `unavailable`; the state is read again afterwards either way.
 */
export function usePushNotifications() {
  const [status, setStatus] = useState<{ state: NotificationsState; subscribed: boolean } | null>(null)
  const [busy, setBusy] = useState(false)
  const mountedRef = useRef(true)
  const unavailableRef = useRef(false)

  const refresh = useCallback(async () => {
    const next = await readPushState().catch(() => UNSUPPORTED)
    if (!mountedRef.current) return
    setStatus(unavailableRef.current ? { state: 'unavailable', subscribed: next.subscribed } : next)
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

  const enable = useCallback(
    () =>
      run(async (): Promise<NotificationPermission | null> => {
        try {
          return await enablePush()
        } catch (error) {
          if (!isApiError(error) || error.code !== PUSH_NOT_CONFIGURED_CODE) throw error
          unavailableRef.current = true
          return null
        }
      }),
    [run],
  )
  const disable = useCallback(() => run(disablePush), [run])

  return { state: status?.state ?? null, subscribed: status?.subscribed ?? false, busy, enable, disable }
}
