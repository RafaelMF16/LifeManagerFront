import { useCallback, useEffect, useState } from 'react'
import { getDashboardDays } from '../services/financeDashboardService'
import type { DashboardDaysResponseDto } from '../types/DashboardDtos'

export type DashboardDaysStatus = 'loading' | 'ready' | 'error'

interface FetchResult {
  /** Which request this outcome belongs to, so a stale one is never shown as current. */
  key: string
  data?: DashboardDaysResponseDto
  failed?: boolean
}

/**
 * The calendar's month and its days. It starts on the period's newest month and only steps through the period's
 * months (`yyyy-MM`, oldest first); the caller keys it by period, so a new period starts over.
 */
export function useDashboardDays(months: string[]) {
  const [month, setMonth] = useState(months[months.length - 1])
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)

  const requestKey = JSON.stringify([month, reloadKey])

  useEffect(() => {
    // Aborted when the month changes or on unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()
    const key = JSON.stringify([month, reloadKey])

    getDashboardDays(month, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ key, data })
      },
      () => {
        if (!controller.signal.aborted) setResult((previous) => ({ key, data: previous?.data, failed: true }))
      },
    )

    return () => controller.abort()
  }, [month, reloadKey])

  // The previous month stays on screen while the next one loads, so the card doesn't flash.
  const data = result?.data
  const isFetching = result?.key !== requestKey
  const current = result?.key === requestKey ? result : null
  const status: DashboardDaysStatus = current?.failed ? 'error' : data ? 'ready' : 'loading'

  const index = months.indexOf(month)
  const previousMonth = index > 0 ? months[index - 1] : null
  const nextMonth = index >= 0 && index < months.length - 1 ? months[index + 1] : null
  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { month, setMonth, data, status, isFetching, reload, previousMonth, nextMonth }
}
