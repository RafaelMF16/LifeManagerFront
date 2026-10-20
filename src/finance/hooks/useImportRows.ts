import { useCallback, useEffect, useState } from 'react'
import { useDebouncedValue } from '../../shared/hooks/useDebouncedValue'
import type { PagedResponse, SortDirection } from '../../shared/types/Paging'
import {
  applyStatementImportRowToSimilar,
  bulkUpdateStatementImportRows,
  getStatementImportRows,
  updateStatementImportRow,
} from '../services/statementImportService'
import type {
  StatementImportBulkUpdateDto,
  StatementImportRowDto,
  StatementImportRowFilter,
  StatementImportRowRequestDto,
  StatementImportRowSortBy,
} from '../types/StatementImportDtos'

export type ImportRowsStatus = 'loading' | 'ready' | 'error'

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 300

/** A statement reads in date order, oldest first; the other columns start from their natural order. */
const INITIAL_DIRECTION: Record<StatementImportRowSortBy, SortDirection> = {
  Date: 'Asc',
  Description: 'Asc',
  Category: 'Asc',
  Amount: 'Desc',
}

/** Identifies the month + filter + search + sort a page number was chosen for. */
function toQueryKey(
  importId: number,
  month: string | null,
  filter: StatementImportRowFilter,
  search: string,
  sortBy: StatementImportRowSortBy,
  sortDirection: SortDirection,
) {
  return JSON.stringify([importId, month, filter, search, sortBy, sortDirection])
}

interface FetchResult {
  /** Which query this outcome belongs to, so a stale one is never shown as current. */
  key: string
  data?: PagedResponse<StatementImportRowDto>
  failed: boolean
}

/**
 * Owns a draft's rows listing (month, filter, search, sort, page) — all applied on the server. Every change
 * refetches the current page and calls `onMutated`, since it also moves the months' counts and totals.
 */
export function useImportRows(importId: number, onMutated: () => void) {
  const [month, setMonth] = useState<string | null>(null)
  const [filter, setFilter] = useState<StatementImportRowFilter>('All')
  const [searchInput, setSearchInput] = useState('')
  const [sortBy, setSortBy] = useState<StatementImportRowSortBy>('Date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('Asc')
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)
  // The page remembers which query it was chosen for: changing the month, a filter or the sort derives page 1
  // during render, without an extra state update. Every useState stays above the derived values.
  const [pageState, setPageState] = useState({ page: 1, queryKey: '' })
  const search = useDebouncedValue(searchInput.trim(), SEARCH_DEBOUNCE_MS)
  const queryKey = toQueryKey(importId, month, filter, search, sortBy, sortDirection)
  const page = pageState.queryKey === queryKey ? pageState.page : 1

  const requestKey = JSON.stringify([page, queryKey, reloadKey])

  useEffect(() => {
    // Aborted when the query changes or on unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()
    const currentQueryKey = toQueryKey(importId, month, filter, search, sortBy, sortDirection)
    const key = JSON.stringify([page, currentQueryKey, reloadKey])

    getStatementImportRows(importId, { page, pageSize: PAGE_SIZE, month, filter, search, sortBy, sortDirection }, controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return
        // The page emptied out (e.g. its rows left the "uncategorized" filter): step back to the new last page.
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
  }, [importId, page, month, filter, search, sortBy, sortDirection, reloadKey])

  // The last successful page stays on screen while the next one loads, so the list doesn't flash.
  const data = result?.data
  const isFetching = result?.key !== requestKey
  const status: ImportRowsStatus = result?.key === requestKey && result.failed ? 'error' : data ? 'ready' : 'loading'

  const setPage = useCallback((nextPage: number) => setPageState({ page: nextPage, queryKey }), [queryKey])

  const clearFilters = useCallback(() => {
    setMonth(null)
    setFilter('All')
    setSearchInput('')
  }, [])

  const changeSortBy = useCallback((column: StatementImportRowSortBy) => {
    setSortBy(column)
    setSortDirection(INITIAL_DIRECTION[column])
  }, [])

  const toggleSortDirection = useCallback(() => setSortDirection((current) => (current === 'Asc' ? 'Desc' : 'Asc')), [])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  const afterMutation = useCallback(() => {
    reload()
    onMutated()
  }, [reload, onMutated])

  const updateRow = useCallback(
    async (rowId: number, request: StatementImportRowRequestDto) => {
      const updated = await updateStatementImportRow(importId, rowId, request)
      afterMutation()
      return updated
    },
    [importId, afterMutation],
  )

  const bulkUpdate = useCallback(
    async (request: StatementImportBulkUpdateDto) => {
      const changed = await bulkUpdateStatementImportRows(importId, request)
      afterMutation()
      return changed
    },
    [importId, afterMutation],
  )

  const applyToSimilar = useCallback(
    async (rowId: number) => {
      const changed = await applyStatementImportRowToSimilar(importId, rowId)
      afterMutation()
      return changed
    },
    [importId, afterMutation],
  )

  return {
    data,
    status,
    isFetching,
    /** Identifies the page on screen (query + page number), e.g. to drop a selection made on another page. */
    pageKey: JSON.stringify([page, queryKey]),
    month,
    setMonth,
    filter,
    setFilter,
    searchInput,
    setSearchInput,
    hasFilters: month !== null || filter !== 'All' || search !== '',
    clearFilters,
    sortBy,
    sortDirection,
    changeSortBy,
    toggleSortDirection,
    setPage,
    reload,
    /** Refetches both the rows and the months, e.g. after a row vanished on the server. */
    reloadAll: afterMutation,
    updateRow,
    bulkUpdate,
    applyToSimilar,
  }
}
