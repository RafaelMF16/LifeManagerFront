import { useCallback, useEffect, useState } from 'react'
import { getPlayerProfile } from '../services/playerProfileService'
import type { PlayerProfileDto } from '../types/PlayerProfileDtos'

export type PlayerProfileStatus = 'loading' | 'ready' | 'error'

interface FetchResult {
  /** Which request this outcome belongs to, so a stale one is never shown as current. */
  key: number
  data?: PlayerProfileDto
  failed?: boolean
}

/** Loads the player's profile. `reload` refetches it, e.g. after a check-in. */
export function usePlayerProfile() {
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)

  useEffect(() => {
    // Aborted on reload or unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()

    getPlayerProfile(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ key: reloadKey, data })
      },
      () => {
        if (controller.signal.aborted) return
        setResult((previous) => ({ key: reloadKey, data: previous?.data, failed: true }))
      },
    )

    return () => controller.abort()
  }, [reloadKey])

  // The previous profile stays on screen while a reload runs, so the bars don't flash.
  const data = result?.data
  const isFetching = result?.key !== reloadKey
  const failed = result?.key === reloadKey && result.failed === true
  const status: PlayerProfileStatus = data ? 'ready' : failed ? 'error' : 'loading'

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { data, status, isFetching, reload }
}
