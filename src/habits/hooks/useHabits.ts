import { useCallback, useEffect, useState } from 'react'
import { useDebouncedValue } from '../../shared/hooks/useDebouncedValue'
import type { PagedResponse, SortDirection } from '../../shared/types/Paging'
import {
  archiveHabit as archiveRequest,
  createHabit as createRequest,
  getHabits,
  restoreHabit as restoreRequest,
  updateHabit as updateRequest,
} from '../services/habitService'
import type { HabitResponseDto, HabitSortBy, HabitStatusFilter } from '../types/HabitDtos'
import type { HabitFormValues } from '../validation/habitSchema'

export type HabitsStatus = 'loading' | 'ready' | 'error'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 300

/** Names A→Z; creation date from the newest. */
const INITIAL_DIRECTION: Record<HabitSortBy, SortDirection> = {
  Name: 'Asc',
  CreatedAt: 'Desc',
}

/** Identifies the filters + sort a page number was chosen for. */
function toQueryKey(status: HabitStatusFilter, search: string, sortBy: HabitSortBy, sortDirection: SortDirection) {
  return JSON.stringify([status, search, sortBy, sortDirection])
}

interface FetchResult {
  /** Which query this outcome belongs to, so a stale one is never shown as current. */
  key: string
  data?: PagedResponse<HabitResponseDto>
  failed: boolean
}

/**
 * Owns the habits listing (page, active/archived, search, sort) — filtering, sorting and pagination all run on the
 * server. Mutations refetch the current page instead of patching a local list.
 */
export function useHabits() {
  const [status, setStatus] = useState<HabitStatusFilter>('Active')
  const [searchInput, setSearchInput] = useState('')
  const [sortBy, setSortBy] = useState<HabitSortBy>('Name')
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

    getHabits({ page, pageSize: PAGE_SIZE, status, search, sortBy, sortDirection }, controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return
        // The page emptied out (e.g. its last habit was archived): step back to the new last page.
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
  const listStatus: HabitsStatus = result?.key === requestKey && result.failed ? 'error' : data ? 'ready' : 'loading'

  const setPage = useCallback((nextPage: number) => setPageState({ page: nextPage, queryKey }), [queryKey])

  const changeSortBy = useCallback((column: HabitSortBy) => {
    setSortBy(column)
    setSortDirection(INITIAL_DIRECTION[column])
  }, [])

  const toggleSortDirection = useCallback(() => setSortDirection((current) => (current === 'Asc' ? 'Desc' : 'Asc')), [])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  const createHabit = useCallback(
    async (values: HabitFormValues) => {
      await createRequest(values)
      reload()
    },
    [reload],
  )

  const updateHabit = useCallback(
    async (id: number, values: HabitFormValues) => {
      await updateRequest(id, values)
      reload()
    },
    [reload],
  )

  const archiveHabit = useCallback(
    async (id: number) => {
      await archiveRequest(id)
      reload()
    },
    [reload],
  )

  const restoreHabit = useCallback(
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
    createHabit,
    updateHabit,
    archiveHabit,
    restoreHabit,
  }
}
