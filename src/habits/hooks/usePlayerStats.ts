import { useCallback, useEffect, useState } from 'react'
import { getPlayerStats } from '../services/playerProfileService'
import type { PlayerStatsDto } from '../types/PlayerProfileDtos'

export type PlayerStatsStatus = 'loading' | 'ready' | 'error'

interface FetchResult {
  /** Which reload this outcome belongs to, so a stale one is never shown as current. */
  reloadKey: number
  data?: PlayerStatsDto
  failed: boolean
}

/** The player's lifetime numbers; the last answer stays on screen while the next one loads. */
export function usePlayerStats() {
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)

  useEffect(() => {
    // Aborted on reload or unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()

    getPlayerStats(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ reloadKey, data, failed: false })
      },
      () => {
        if (!controller.signal.aborted) setResult((previous) => ({ reloadKey, data: previous?.data, failed: true }))
      },
    )

    return () => controller.abort()
  }, [reloadKey])

  const data = result?.data
  const status: PlayerStatsStatus = result?.reloadKey === reloadKey && result.failed ? 'error' : data ? 'ready' : 'loading'

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { data, status, reload }
}
