import { useCallback, useEffect, useState } from 'react'
import { getPlayerEvolution } from '../services/playerProfileService'
import type { EvolutionRange, PlayerEvolutionDto } from '../types/PlayerProfileDtos'

export type PlayerEvolutionStatus = 'loading' | 'ready' | 'error'

interface FetchResult {
  /** Which request this outcome belongs to, so a stale one is never shown as current. */
  requestKey: string
  data?: PlayerEvolutionDto
  failed: boolean
}

/**
 * XP and coins day by day over `range`. Switching the range keeps the previous chart on screen (`isFetching`) until
 * the next one arrives, so the frame never jumps.
 */
export function usePlayerEvolution(range: EvolutionRange) {
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)
  const requestKey = `${range}:${reloadKey}`

  useEffect(() => {
    // Aborted on a new range, reload or unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()

    getPlayerEvolution(range, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ requestKey: `${range}:${reloadKey}`, data, failed: false })
      },
      () => {
        if (!controller.signal.aborted) setResult((previous) => ({ requestKey: `${range}:${reloadKey}`, data: previous?.data, failed: true }))
      },
    )

    return () => controller.abort()
  }, [range, reloadKey])

  const data = result?.data
  const isFetching = result?.requestKey !== requestKey
  const status: PlayerEvolutionStatus = result?.requestKey === requestKey && result.failed ? 'error' : data ? 'ready' : 'loading'

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { data, status, isFetching, reload }
}
