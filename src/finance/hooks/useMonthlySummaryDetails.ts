import { useCallback, useEffect, useState } from 'react'
import { isApiError } from '../../shared/types/ApiError'
import { getMonthlySummary } from '../services/monthlySummaryService'
import type { MonthlySummaryDetailsDto } from '../types/MonthlySummaryDtos'
import { MONTHLY_SUMMARY_NOT_FOUND_CODE } from '../validation/transactionErrorMap'

export type MonthlySummaryDetailsStatus = 'loading' | 'ready' | 'error' | 'notFound'

interface FetchResult {
  /** Which request this outcome belongs to, so a stale one is never shown as current. */
  key: string
  data?: MonthlySummaryDetailsDto
  failure?: 'error' | 'notFound'
}

/** Loads one month (totals, counts, neighbours). `reload` refetches it, e.g. after a transaction changes. */
export function useMonthlySummaryDetails(monthlySummaryId: number) {
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)

  const requestKey = JSON.stringify([monthlySummaryId, reloadKey])

  useEffect(() => {
    // Aborted when the month changes or on unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()
    const key = JSON.stringify([monthlySummaryId, reloadKey])

    getMonthlySummary(monthlySummaryId, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ key, data })
      },
      (err: unknown) => {
        if (controller.signal.aborted) return
        const failure = isApiError(err) && err.code === MONTHLY_SUMMARY_NOT_FOUND_CODE ? 'notFound' : 'error'
        setResult((previous) => ({ key, data: previous?.data, failure }))
      },
    )

    return () => controller.abort()
  }, [monthlySummaryId, reloadKey])

  // The previous month stays on screen while the next one loads, so the page doesn't flash.
  const data = result?.data
  const isFetching = result?.key !== requestKey
  const current = result?.key === requestKey ? result : null
  const status: MonthlySummaryDetailsStatus = current?.failure ?? (data ? 'ready' : 'loading')

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { data, status, isFetching, reload }
}
