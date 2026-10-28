import { useCallback, useEffect, useState } from 'react'
import { getGameItems } from '../services/gameItemService'
import type { GameItemsResponseDto } from '../types/GameItemDtos'

export type GameItemsStatus = 'loading' | 'ready' | 'error'

interface FetchResult {
  /** Which reload this outcome belongs to, so a stale one is never shown as current. */
  reloadKey: number
  data?: GameItemsResponseDto
  failed: boolean
}

/**
 * The shop's game items with the player's limits, plus today's purchases. Not paged: two fixed items. A purchase or an
 * undo calls `reload`, and the last answer stays on screen while the next one loads.
 */
export function useGameItems() {
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)

  useEffect(() => {
    // Aborted on reload or unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()

    getGameItems(controller.signal).then(
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
  const status: GameItemsStatus = result?.reloadKey === reloadKey && result.failed ? 'error' : data ? 'ready' : 'loading'

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { data, status, isFetching, reload }
}
