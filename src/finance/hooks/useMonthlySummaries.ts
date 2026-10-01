import { useCallback, useEffect, useState } from 'react'
import type { PagedResponse, SortDirection } from '../../shared/types/Paging'
import {
  createMonthlySummary as createMonthlySummaryRequest,
  getMonthlySummaries,
  getMonthlySummaryYears,
} from '../services/monthlySummaryService'
import type { BalanceFilter, MonthlySummaryResponseDto, MonthlySummarySortBy } from '../types/MonthlySummaryDtos'
import type { MonthlySummaryFormValues } from '../validation/monthlySummarySchema'

export type MonthlySummariesStatus = 'loading' | 'ready' | 'error'

const PAGE_SIZE = 8

/** Identifies the filters + sort a page number was chosen for. */
function toQueryKey(year: number | null, balance: BalanceFilter, sortBy: MonthlySummarySortBy, sortDirection: SortDirection) {
  return JSON.stringify([year, balance, sortBy, sortDirection])
}

interface FetchResult {
  /** Which query this outcome belongs to, so a stale one is never shown as current. */
  key: string
  data?: PagedResponse<MonthlySummaryResponseDto>
  failed: boolean
}

/**
 * Owns the months listing query (page, year, balance filter, sort) — filtering, sorting and pagination
 * all run on the server. Creating a month refetches the current page and the year options.
 */
export function useMonthlySummaries() {
  const [year, setYear] = useState<number | null>(null)
  const [balance, setBalance] = useState<BalanceFilter>('All')
  const [sortBy, setSortBy] = useState<MonthlySummarySortBy>('Period')
  const [sortDirection, setSortDirection] = useState<SortDirection>('Desc')
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)
  const [years, setYears] = useState<number[]>([])
  // The page remembers which query it was chosen for: changing a filter or the sort derives page 1
  // during render, without an extra state update (and an extra request for the stale page).
  // Every useState stays above the derived values: otherwise the React Compiler loses track of the setters.
  const [pageState, setPageState] = useState({ page: 1, queryKey: '' })
  const queryKey = toQueryKey(year, balance, sortBy, sortDirection)
  const page = pageState.queryKey === queryKey ? pageState.page : 1

  const requestKey = JSON.stringify([page, queryKey, reloadKey])

  useEffect(() => {
    // Aborted when the query changes or on unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()
    const key = JSON.stringify([page, toQueryKey(year, balance, sortBy, sortDirection), reloadKey])

    getMonthlySummaries({ page, pageSize: PAGE_SIZE, year, balance, sortBy, sortDirection }, controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return
        // The page emptied out: step back to the new last page.
        if (data.items.length === 0 && data.totalPages > 0 && data.page > data.totalPages) {
          setPageState({ page: data.totalPages, queryKey: toQueryKey(year, balance, sortBy, sortDirection) })
          return
        }
        setResult({ key, data, failed: false })
      },
      () => {
        if (!controller.signal.aborted) setResult((previous) => ({ key, data: previous?.data, failed: true }))
      },
    )

    return () => controller.abort()
  }, [page, year, balance, sortBy, sortDirection, reloadKey])

  useEffect(() => {
    const controller = new AbortController()

    // The year filter just loses its options on failure; the list itself reports load errors.
    getMonthlySummaryYears(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setYears(data)
      },
      () => {},
    )

    return () => controller.abort()
  }, [reloadKey])

  // The last successful page stays on screen while the next one loads, so the table doesn't flash.
  const data = result?.data
  const isFetching = result?.key !== requestKey
  const status: MonthlySummariesStatus = result?.key === requestKey && result.failed ? 'error' : data ? 'ready' : 'loading'

  const setPage = useCallback((nextPage: number) => setPageState({ page: nextPage, queryKey }), [queryKey])

  const clearFilters = useCallback(() => {
    setYear(null)
    setBalance('All')
  }, [])

  /** Header click: the active column flips its direction; a new column starts from the highest/newest. */
  const sortByColumn = useCallback(
    (column: MonthlySummarySortBy) => {
      if (column === sortBy) {
        setSortDirection((current) => (current === 'Asc' ? 'Desc' : 'Asc'))
        return
      }
      setSortBy(column)
      setSortDirection('Desc')
    },
    [sortBy],
  )

  const toggleSortDirection = useCallback(() => setSortDirection((current) => (current === 'Asc' ? 'Desc' : 'Asc')), [])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  const createMonthlySummary = useCallback(
    async (values: MonthlySummaryFormValues) => {
      await createMonthlySummaryRequest(values)
      reload()
    },
    [reload],
  )

  return {
    data,
    status,
    isFetching,
    years,
    year,
    setYear,
    balance,
    setBalance,
    hasFilters: year !== null || balance !== 'All',
    clearFilters,
    sortBy,
    setSortBy,
    sortDirection,
    sortByColumn,
    toggleSortDirection,
    setPage,
    reload,
    createMonthlySummary,
  }
}
