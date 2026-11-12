import { useCallback, useEffect, useState } from 'react'
import { useDebouncedValue } from '../../shared/hooks/useDebouncedValue'
import type { PagedResponse, SortDirection } from '../../shared/types/Paging'
import {
  archiveSavingsGoal as archiveRequest,
  createSavingsGoal as createRequest,
  getSavingsGoals,
  restoreSavingsGoal as restoreRequest,
  updateSavingsGoal as updateRequest,
} from '../services/savingsGoalService'
import type { SavingsGoalResponseDto, SavingsGoalSortBy, SavingsGoalStatusFilter } from '../types/SavingsGoalDtos'
import type { SavingsGoalFormValues } from '../validation/savingsGoalSchema'

export type SavingsGoalsStatus = 'loading' | 'ready' | 'error'

const PAGE_SIZE = 12
const SEARCH_DEBOUNCE_MS = 300

/** Names A→Z, the nearest deadline first, the most advanced goal first. */
const INITIAL_DIRECTION: Record<SavingsGoalSortBy, SortDirection> = {
  Name: 'Asc',
  TargetMonth: 'Asc',
  Progress: 'Desc',
}

/** Identifies the filters + sort a page number was chosen for. */
function toQueryKey(status: SavingsGoalStatusFilter, search: string, sortBy: SavingsGoalSortBy, sortDirection: SortDirection) {
  return JSON.stringify([status, search, sortBy, sortDirection])
}

interface FetchResult {
  /** Which query this outcome belongs to, so a stale one is never shown as current. */
  key: string
  data?: PagedResponse<SavingsGoalResponseDto>
  failed: boolean
}

/**
 * Owns the savings goals listing (page, status, search, sort) — filtering, sorting and pagination all run on the
 * server, progress included. Mutations refetch the current page instead of patching a local list.
 */
export function useSavingsGoals() {
  const [status, setStatus] = useState<SavingsGoalStatusFilter>('Active')
  const [searchInput, setSearchInput] = useState('')
  const [sortBy, setSortBy] = useState<SavingsGoalSortBy>('Name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('Asc')
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)
  // The page remembers which query it was chosen for: changing a filter or the sort derives page 1 during render.
  const [pageState, setPageState] = useState({ page: 1, queryKey: '' })
  const search = useDebouncedValue(searchInput.trim(), SEARCH_DEBOUNCE_MS)
  const queryKey = toQueryKey(status, search, sortBy, sortDirection)
  const page = pageState.queryKey === queryKey ? pageState.page : 1

  const requestKey = JSON.stringify([page, queryKey, reloadKey])

  useEffect(() => {
    // Aborted when the query changes or on unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()
    const currentQueryKey = toQueryKey(status, search, sortBy, sortDirection)
    const key = JSON.stringify([page, currentQueryKey, reloadKey])

    getSavingsGoals({ page, pageSize: PAGE_SIZE, status, search, sortBy, sortDirection }, controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return
        // The page emptied out (e.g. its last goal was archived): step back to the new last page.
        if (data.items.length === 0 && data.totalPages > 0 && data.page > data.totalPages) {
          setPageState({ page: data.totalPages, queryKey: currentQueryKey })
          return
        }
        setResult({ key, data, failed: false })
      },
      () => {
        if (!controller.signal.aborted) setResult((previous) => ({ key, data: previous?.data, failed: true }))
      },
    )

    return () => controller.abort()
  }, [page, status, search, sortBy, sortDirection, reloadKey])

  // The last successful page stays on screen while the next one loads, so the list doesn't flash.
  const data = result?.data
  const isFetching = result?.key !== requestKey
  const listStatus: SavingsGoalsStatus = result?.key === requestKey && result.failed ? 'error' : data ? 'ready' : 'loading'

  const setPage = useCallback((nextPage: number) => setPageState({ page: nextPage, queryKey }), [queryKey])

  const clearSearch = useCallback(() => setSearchInput(''), [])

  const changeSortBy = useCallback((column: SavingsGoalSortBy) => {
    setSortBy(column)
    setSortDirection(INITIAL_DIRECTION[column])
  }, [])

  const toggleSortDirection = useCallback(() => setSortDirection((current) => (current === 'Asc' ? 'Desc' : 'Asc')), [])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  const createSavingsGoal = useCallback(
    async (values: SavingsGoalFormValues) => {
      const created = await createRequest(values)
      reload()
      return created
    },
    [reload],
  )

  const updateSavingsGoal = useCallback(
    async (id: number, values: SavingsGoalFormValues) => {
      const updated = await updateRequest(id, values)
      reload()
      return updated
    },
    [reload],
  )

  const archiveSavingsGoal = useCallback(
    async (id: number) => {
      await archiveRequest(id)
      reload()
    },
    [reload],
  )

  const restoreSavingsGoal = useCallback(
    async (id: number) => {
      await restoreRequest(id)
      reload()
    },
    [reload],
  )

  return {
    data,
    status: listStatus,
    isFetching,
    statusFilter: status,
    setStatusFilter: setStatus,
    searchInput,
    setSearchInput,
    /** The search actually applied to the current results (debounced and trimmed). */
    search,
    hasSearch: search !== '',
    clearSearch,
    sortBy,
    sortDirection,
    changeSortBy,
    toggleSortDirection,
    setPage,
    reload,
    createSavingsGoal,
    updateSavingsGoal,
    archiveSavingsGoal,
    restoreSavingsGoal,
  }
}
