import { useCallback, useEffect, useState } from 'react'
import { useDebouncedValue } from '../../shared/hooks/useDebouncedValue'
import type { PagedResponse, SortDirection } from '../../shared/types/Paging'
import {
  createTransaction as createTransactionRequest,
  deleteTransaction as deleteTransactionRequest,
  getTransactions,
  updateTransaction as updateTransactionRequest,
} from '../services/transactionService'
import type { TransactionResponseDto, TransactionSortBy, TransactionTypeFilter } from '../types/TransactionDtos'
import type { TransactionFormValues } from '../validation/transactionSchema'

export type TransactionsStatus = 'loading' | 'ready' | 'error'

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 300

/** Text columns start A→Z; date and amount start from the newest/highest, like the months list. */
const INITIAL_DIRECTION: Record<TransactionSortBy, SortDirection> = {
  Date: 'Desc',
  Description: 'Asc',
  Category: 'Asc',
  Amount: 'Desc',
}

/** Identifies the month + filters + sort a page number was chosen for. */
function toQueryKey(
  monthlySummaryId: number,
  type: TransactionTypeFilter,
  categoryId: number | null,
  search: string,
  sortBy: TransactionSortBy,
  sortDirection: SortDirection,
) {
  return JSON.stringify([monthlySummaryId, type, categoryId, search, sortBy, sortDirection])
}

interface FetchResult {
  /** Which query this outcome belongs to, so a stale one is never shown as current. */
  key: string
  data?: PagedResponse<TransactionResponseDto>
  failed: boolean
}

/**
 * Owns one month's transactions listing (page, type, category, search, sort) — filtering, sorting and
 * pagination all run on the server. Mutations refetch the current page and call `onMutated`, since every
 * change also moves the month's totals.
 */
export function useTransactions(monthlySummaryId: number, onMutated: () => void) {
  const [type, setType] = useState<TransactionTypeFilter>('All')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [sortBy, setSortBy] = useState<TransactionSortBy>('Date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('Desc')
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)
  // The page remembers which query it was chosen for: changing the month, a filter or the sort derives
  // page 1 during render, without an extra state update (and an extra request for the stale page).
  // Every useState stays above the derived values: otherwise the React Compiler loses track of the setters.
  const [pageState, setPageState] = useState({ page: 1, queryKey: '' })
  const search = useDebouncedValue(searchInput.trim(), SEARCH_DEBOUNCE_MS)
  const queryKey = toQueryKey(monthlySummaryId, type, categoryId, search, sortBy, sortDirection)
  const page = pageState.queryKey === queryKey ? pageState.page : 1

  const requestKey = JSON.stringify([page, queryKey, reloadKey])

  useEffect(() => {
    // Aborted when the query changes or on unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()
    const currentQueryKey = toQueryKey(monthlySummaryId, type, categoryId, search, sortBy, sortDirection)
    const key = JSON.stringify([page, currentQueryKey, reloadKey])

    getTransactions(
      monthlySummaryId,
      { page, pageSize: PAGE_SIZE, type, categoryId, search, sortBy, sortDirection },
      controller.signal,
    ).then(
      (data) => {
        if (controller.signal.aborted) return
        // The page emptied out (e.g. its last transaction was deleted): step back to the new last page.
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
  }, [monthlySummaryId, page, type, categoryId, search, sortBy, sortDirection, reloadKey])

  // The last successful page stays on screen while the next one loads, so the list doesn't flash.
  const data = result?.data
  const isFetching = result?.key !== requestKey
  const status: TransactionsStatus = result?.key === requestKey && result.failed ? 'error' : data ? 'ready' : 'loading'

  const setPage = useCallback((nextPage: number) => setPageState({ page: nextPage, queryKey }), [queryKey])

  const clearFilters = useCallback(() => {
    setType('All')
    setCategoryId(null)
    setSearchInput('')
  }, [])

  /** Header click: the active column flips its direction; a new column starts from its natural order. */
  const sortByColumn = useCallback(
    (column: TransactionSortBy) => {
      if (column === sortBy) {
        setSortDirection((current) => (current === 'Asc' ? 'Desc' : 'Asc'))
        return
      }
      setSortBy(column)
      setSortDirection(INITIAL_DIRECTION[column])
    },
    [sortBy],
  )

  /** Compact screens pick the column from a select; it starts from its natural order too. */
  const changeSortBy = useCallback((column: TransactionSortBy) => {
    setSortBy(column)
    setSortDirection(INITIAL_DIRECTION[column])
  }, [])

  const toggleSortDirection = useCallback(() => setSortDirection((current) => (current === 'Asc' ? 'Desc' : 'Asc')), [])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  const afterMutation = useCallback(() => {
    reload()
    onMutated()
  }, [reload, onMutated])

  const createTransaction = useCallback(
    async (values: TransactionFormValues) => {
      await createTransactionRequest(monthlySummaryId, values)
      afterMutation()
    },
    [monthlySummaryId, afterMutation],
  )

  const updateTransaction = useCallback(
    async (id: number, values: TransactionFormValues) => {
      await updateTransactionRequest(monthlySummaryId, id, values)
      afterMutation()
    },
    [monthlySummaryId, afterMutation],
  )

  const deleteTransaction = useCallback(
    async (id: number) => {
      await deleteTransactionRequest(monthlySummaryId, id)
      afterMutation()
    },
    [monthlySummaryId, afterMutation],
  )

  return {
    data,
    status,
    isFetching,
    type,
    setType,
    categoryId,
    setCategoryId,
    searchInput,
    setSearchInput,
    /** The search actually applied to the current results (debounced and trimmed). */
    search,
    hasFilters: type !== 'All' || categoryId !== null || search !== '',
    clearFilters,
    sortBy,
    sortDirection,
    sortByColumn,
    changeSortBy,
    toggleSortDirection,
    setPage,
    reload,
    /** Refetches both the list and the month, e.g. after a transaction vanished on the server. */
    reloadAll: afterMutation,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  }
}
