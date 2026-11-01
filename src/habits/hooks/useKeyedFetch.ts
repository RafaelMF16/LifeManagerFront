import { useCallback, useEffect, useState } from 'react'
import { isApiError } from '../../shared/types/ApiError'

export type KeyedFetchStatus = 'loading' | 'ready' | 'error'

interface FetchResult<T> {
  /** Which request this outcome belongs to, so a stale one is never shown as current. */
  requestKey: string
  data?: T
  /** The backend's error code when it refused (e.g. a group the user isn't in). */
  errorCode?: string
  failed: boolean
}

/**
 * One read keyed by `key` (it reloads when the key changes or on `reload`). The last answer stays on screen while the
 * next one loads; `replace` swaps it for one a mutation already returned.
 */
export function useKeyedFetch<T>(key: string, load: (signal: AbortSignal) => Promise<T>) {
  const [reloadCount, setReloadCount] = useState(0)
  const [result, setResult] = useState<FetchResult<T> | null>(null)
  const requestKey = `${key}#${reloadCount}`

  useEffect(() => {
    // Aborted on reload or unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()

    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ requestKey, data, failed: false })
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        const errorCode = isApiError(err) ? err.code : undefined
        // Another key's answer isn't kept: it would show the wrong group or week under the error.
        setResult((previous) => ({
          requestKey,
          data: previous?.requestKey.startsWith(`${key}#`) ? previous.data : undefined,
          errorCode,
          failed: true,
        }))
      },
    )

    return () => controller.abort()
    // `load` is rebuilt every render; `requestKey` already says when to read again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey])

  const sameKey = result?.requestKey.startsWith(`${key}#`) ?? false
  const data = sameKey ? result?.data : undefined
  const current = result?.requestKey === requestKey
  const status: KeyedFetchStatus = current && result?.failed ? 'error' : data ? 'ready' : 'loading'

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])
  const replace = useCallback(
    (update: (previous: T) => T) =>
      setResult((previous) => (previous?.data ? { ...previous, data: update(previous.data) } : previous)),
    [],
  )

  return { data, status, isFetching: !current, errorCode: current ? result?.errorCode : undefined, reload, replace }
}
