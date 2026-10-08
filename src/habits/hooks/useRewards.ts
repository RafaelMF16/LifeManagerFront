import { useCallback, useEffect, useState } from 'react'
import { useDebouncedValue } from '../../shared/hooks/useDebouncedValue'
import type { PagedResponse, SortDirection } from '../../shared/types/Paging'
import {
  archiveReward as archiveRequest,
  createReward as createRequest,
  getRewards,
  restoreReward as restoreRequest,
  updateReward as updateRequest,
} from '../services/rewardService'
import type { RewardResponseDto, RewardSortBy, RewardStatusFilter } from '../types/RewardDtos'
import type { RewardFormValues } from '../validation/rewardSchema'

export type RewardsStatus = 'loading' | 'ready' | 'error'

const PAGE_SIZE = 12
const SEARCH_DEBOUNCE_MS = 300

/** Identifies the filters + sort a page number was chosen for. */
function toQueryKey(status: RewardStatusFilter, search: string, sortBy: RewardSortBy, sortDirection: SortDirection) {
  return JSON.stringify([status, search, sortBy, sortDirection])
}

interface FetchResult {
  /** Which query this outcome belongs to, so a stale one is never shown as current. */
  key: string
  data?: PagedResponse<RewardResponseDto>
  failed: boolean
}

/**
 * Owns the shop's listing (page, active/archived, search, sort; cheapest first by default) — filtering, sorting and
 * pagination all run on the server. Mutations refetch the current page instead of patching a local list.
 */
export function useRewards() {
  const [status, setStatus] = useState<RewardStatusFilter>('Active')
  const [searchInput, setSearchInput] = useState('')
  const [sortBy, setSortBy] = useState<RewardSortBy>('Cost')
  const [sortDirection, setSortDirection] = useState<SortDirection>('Asc')
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)
  // The page remembers which query it was chosen for: changing a filter or the sort derives page 1 during
  // render, without an extra state update. Every useState stays above the derived values (React Compiler).
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

    getRewards({ page, pageSize: PAGE_SIZE, status, search, sortBy, sortDirection }, controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return
        // The page emptied out (e.g. its last reward was archived): step back to the new last page.
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
  const listStatus: RewardsStatus = result?.key === requestKey && result.failed ? 'error' : data ? 'ready' : 'loading'

  const setPage = useCallback((nextPage: number) => setPageState({ page: nextPage, queryKey }), [queryKey])

  /** Both columns start ascending: A→Z, cheapest first. */
  const changeSortBy = useCallback((column: RewardSortBy) => {
    setSortBy(column)
    setSortDirection('Asc')
  }, [])

  const toggleSortDirection = useCallback(() => setSortDirection((current) => (current === 'Asc' ? 'Desc' : 'Asc')), [])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  const createReward = useCallback(
    async (values: RewardFormValues) => {
      await createRequest(values)
      reload()
    },
    [reload],
  )

  const updateReward = useCallback(
    async (id: number, values: RewardFormValues) => {
      await updateRequest(id, values)
      reload()
    },
    [reload],
  )

  const archiveReward = useCallback(
    async (id: number) => {
      await archiveRequest(id)
      reload()
    },
    [reload],
  )

  const restoreReward = useCallback(
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
    sortBy,
    sortDirection,
    changeSortBy,
    toggleSortDirection,
    setPage,
    reload,
    createReward,
    updateReward,
    archiveReward,
    restoreReward,
  }
}
