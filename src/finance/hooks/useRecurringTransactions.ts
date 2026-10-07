import { useCallback, useEffect, useState } from 'react'
import { useDebouncedValue } from '../../shared/hooks/useDebouncedValue'
import type { PagedResponse, SortDirection } from '../../shared/types/Paging'
import {
  createRecurringTransaction as createRequest,
  deleteRecurringTransaction as deleteRequest,
  getRecurringTransactions,
  pauseRecurringTransaction as pauseRequest,
  resumeRecurringTransaction as resumeRequest,
  updateRecurringTransaction as updateRequest,
} from '../services/recurringTransactionService'
import type {
  RecurringTransactionResponseDto,
  RecurringTransactionSortBy,
  RecurringTransactionStatusFilter,
} from '../types/RecurringTransactionDtos'
import type { TransactionTypeFilter } from '../types/TransactionDtos'
import type { RecurringTransactionFormValues } from '../validation/recurringTransactionSchema'

export type RecurringTransactionsStatus = 'loading' | 'ready' | 'error'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 300

/** The next occurrence and the day start from the soonest, text A→Z, the amount from the highest. */
const INITIAL_DIRECTION: Record<RecurringTransactionSortBy, SortDirection> = {
  NextOccurrence: 'Asc',
  Description: 'Asc',
  Amount: 'Desc',
  Day: 'Asc',
}

/** Identifies the filters + sort a page number was chosen for. */
function toQueryKey(
  type: TransactionTypeFilter,
  status: RecurringTransactionStatusFilter,
  search: string,
  sortBy: RecurringTransactionSortBy,
  sortDirection: SortDirection,
) {
  return JSON.stringify([type, status, search, sortBy, sortDirection])
}

interface FetchResult {
  /** Which query this outcome belongs to, so a stale one is never shown as current. */
  key: string
  data?: PagedResponse<RecurringTransactionResponseDto>
  failed: boolean
}

/**
 * Owns the recurring transactions listing (page, type, status, search, sort) — filtering, sorting and pagination
 * all run on the server. Mutations refetch the current page instead of patching a local list.
 */
export function useRecurringTransactions() {
  const [type, setType] = useState<TransactionTypeFilter>('All')
  const [status, setStatus] = useState<RecurringTransactionStatusFilter>('All')
  const [searchInput, setSearchInput] = useState('')
  const [sortBy, setSortBy] = useState<RecurringTransactionSortBy>('NextOccurrence')
  const [sortDirection, setSortDirection] = useState<SortDirection>('Asc')
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)
  // The page remembers which query it was chosen for: changing a filter or the sort derives page 1 during
  // render, without an extra state update. Every useState stays above the derived values (React Compiler).
  const [pageState, setPageState] = useState({ page: 1, queryKey: '' })
  const search = useDebouncedValue(searchInput.trim(), SEARCH_DEBOUNCE_MS)
  const queryKey = toQueryKey(type, status, search, sortBy, sortDirection)
  const page = pageState.queryKey === queryKey ? pageState.page : 1

  const requestKey = JSON.stringify([page, queryKey, reloadKey])

  useEffect(() => {
    // Aborted when the query changes or on unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()
    const currentQueryKey = toQueryKey(type, status, search, sortBy, sortDirection)
    const key = JSON.stringify([page, currentQueryKey, reloadKey])

    getRecurringTransactions({ page, pageSize: PAGE_SIZE, type, status, search, sortBy, sortDirection }, controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return
        // The page emptied out (e.g. its last item was deleted): step back to the new last page.
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
  }, [page, type, status, search, sortBy, sortDirection, reloadKey])

  // The last successful page stays on screen while the next one loads, so the list doesn't flash.
  const data = result?.data
  const isFetching = result?.key !== requestKey
  const listStatus: RecurringTransactionsStatus = result?.key === requestKey && result.failed ? 'error' : data ? 'ready' : 'loading'

  const setPage = useCallback((nextPage: number) => setPageState({ page: nextPage, queryKey }), [queryKey])

  const clearFilters = useCallback(() => {
    setType('All')
    setStatus('All')
    setSearchInput('')
  }, [])

  const changeSortBy = useCallback((column: RecurringTransactionSortBy) => {
    setSortBy(column)
    setSortDirection(INITIAL_DIRECTION[column])
  }, [])

  const toggleSortDirection = useCallback(() => setSortDirection((current) => (current === 'Asc' ? 'Desc' : 'Asc')), [])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  const createRecurringTransaction = useCallback(
    async (values: RecurringTransactionFormValues) => {
      const created = await createRequest(values)
      reload()
      return created
    },
    [reload],
  )

  const updateRecurringTransaction = useCallback(
    async (id: number, values: RecurringTransactionFormValues) => {
      const updated = await updateRequest(id, values)
      reload()
      return updated
    },
    [reload],
  )

  const pauseRecurringTransaction = useCallback(
    async (id: number) => {
      await pauseRequest(id)
      reload()
    },
    [reload],
  )

  const resumeRecurringTransaction = useCallback(
    async (id: number) => {
      await resumeRequest(id)
      reload()
    },
    [reload],
  )

  const deleteRecurringTransaction = useCallback(
    async (id: number) => {
      await deleteRequest(id)
      reload()
    },
    [reload],
  )

  return {
    data,
    status: listStatus,
    isFetching,
    type,
    setType,
    statusFilter: status,
    setStatusFilter: setStatus,
    searchInput,
    setSearchInput,
    /** The search actually applied to the current results (debounced and trimmed). */
    search,
    hasFilters: type !== 'All' || status !== 'All' || search !== '',
    clearFilters,
    sortBy,
    sortDirection,
    changeSortBy,
    toggleSortDirection,
    setPage,
    reload,
    createRecurringTransaction,
    updateRecurringTransaction,
    pauseRecurringTransaction,
    resumeRecurringTransaction,
    deleteRecurringTransaction,
  }
}
