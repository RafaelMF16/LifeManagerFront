import { useCallback, useEffect, useState } from 'react'
import { getAchievements } from '../services/achievementService'
import type { AchievementsResponseDto } from '../types/AchievementDtos'

export type AchievementsStatus = 'loading' | 'ready' | 'error'

interface FetchResult {
  /** Which reload this outcome belongs to, so a stale one is never shown as current. */
  reloadKey: number
  data?: AchievementsResponseDto
  failed: boolean
}

/**
 * Every achievement with the player's progress. Reading it also unlocks what the history reaches, so `reload` after
 * the moment closes shows the new ones; the last answer stays on screen while the next one loads.
 */
export function useAchievements() {
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)

  useEffect(() => {
    // Aborted on reload or unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()

    getAchievements(controller.signal).then(
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
  const isFetching = result?.reloadKey !== reloadKey
  const status: AchievementsStatus = result?.reloadKey === reloadKey && result.failed ? 'error' : data ? 'ready' : 'loading'

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { data, status, isFetching, reload }
}
