import { useCallback, useEffect, useState } from 'react'
import type { PagedResponse } from '../../shared/types/Paging'
import { getLedger } from '../services/habitStatsService'
import type { GameLedgerEntryDto } from '../types/LedgerDtos'

export type LedgerStatus = 'loading' | 'ready' | 'error'

interface FetchResult {
  /** Which request this outcome belongs to, so a stale one is never shown as current. */
  key: string
  data?: PagedResponse<GameLedgerEntryDto>
  failed: boolean
}

/** The player's statement, newest first and paged on the server; only one habit's entries when `habitId` is given. */
export function useLedger(pageSize: number, habitId?: number) {
  const [pageState, setPageState] = useState({ page: 1, habitId })
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)
  // Another habit starts on page 1, derived during render without an extra state update.
  const page = pageState.habitId === habitId ? pageState.page : 1
  const requestKey = JSON.stringify([page, habitId, reloadKey])

  useEffect(() => {
    // Aborted on a page change, a reload or unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()
    const key = JSON.stringify([page, habitId, reloadKey])

    getLedger(page, pageSize, habitId, controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ key, data, failed: false })
      },
      () => {
        if (!controller.signal.aborted) setResult((previous) => ({ key, data: previous?.data, failed: true }))
      },
    )

    return () => controller.abort()
  }, [page, pageSize, habitId, reloadKey])

  // The last successful page stays on screen while the next one loads, so the list doesn't flash.
  const data = result?.data
  const isFetching = result?.key !== requestKey
  const status: LedgerStatus = result?.key === requestKey && result.failed ? 'error' : data ? 'ready' : 'loading'

  const setPage = useCallback((nextPage: number) => setPageState({ page: nextPage, habitId }), [habitId])
  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { data, status, isFetching, setPage, reload }
}
