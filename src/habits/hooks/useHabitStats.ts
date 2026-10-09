import { useCallback, useEffect, useState } from 'react'
import { isApiError } from '../../shared/types/ApiError'
import { getHabitStats } from '../services/habitStatsService'
import type { HabitStatsDto } from '../types/HabitStatsDtos'
import { HABIT_NOT_FOUND_CODE } from '../validation/habitErrorMap'

export type HabitStatsStatus = 'loading' | 'ready' | 'error' | 'notFound'

interface FetchResult {
  /** Which request this outcome belongs to, so a stale one is never shown as current. */
  key: string
  data?: HabitStatsDto
  failure?: 'error' | 'notFound'
}

/** Loads one habit's history (heatmap, consistency, days kept). `reload` refetches it. */
export function useHabitStats(habitId: number) {
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)

  const requestKey = JSON.stringify([habitId, reloadKey])

  useEffect(() => {
    // Aborted when the habit changes or on unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()
    const key = JSON.stringify([habitId, reloadKey])

    getHabitStats(habitId, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ key, data })
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        const failure = isApiError(err) && err.code === HABIT_NOT_FOUND_CODE ? 'notFound' : 'error'
        setResult((previous) => ({ key, data: previous?.data, failure }))
      },
    )

    return () => controller.abort()
  }, [habitId, reloadKey])

  // The previous habit stays on screen while the next one loads, so the page doesn't flash.
  const data = result?.data
  const isFetching = result?.key !== requestKey
  const current = result?.key === requestKey ? result : null
  const status: HabitStatsStatus = current?.failure ?? (data ? 'ready' : 'loading')

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { data, status, isFetching, reload }
}
