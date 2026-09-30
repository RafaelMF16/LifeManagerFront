import { useCallback, useEffect, useState } from 'react'
import { useDebouncedValue } from '../../shared/hooks/useDebouncedValue'
import type { PagedResponse, SortDirection } from '../../shared/types/Paging'
import {
  createCategory as createCategoryRequest,
  deleteCategory as deleteCategoryRequest,
  getCategories,
  updateCategory as updateCategoryRequest,
} from '../services/categoryService'
import type { CategoryResponseDto } from '../types/CategoryDtos'
import type { CategoryFormValues } from '../validation/categorySchema'

export type CategoriesStatus = 'loading' | 'ready' | 'error'

const PAGE_SIZE = 8
const SEARCH_DEBOUNCE_MS = 300

interface FetchResult {
  /** Which query this outcome belongs to, so a stale one is never shown as current. */
  key: string
  data?: PagedResponse<CategoryResponseDto>
  failed: boolean
}

/**
 * Owns the categories listing query (page, search, sort) — search, sort and pagination all run on
 * the server. Mutations refetch the current page instead of patching a local list.
 */
export function useCategories() {
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput.trim(), SEARCH_DEBOUNCE_MS)
  const [sortDirection, setSortDirection] = useState<SortDirection>('Asc')
  // The page remembers which search it was chosen for: a new search derives page 1 during render,
  // without an extra state update (and an extra request for the stale page).
  const [pageState, setPageState] = useState({ page: 1, search: '' })
  const page = pageState.search === search ? pageState.page : 1
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<FetchResult | null>(null)

  const requestKey = JSON.stringify([page, search, sortDirection, reloadKey])

  useEffect(() => {
    // Aborted when the query changes or on unmount, which also fires the backend's CancellationToken.
    const controller = new AbortController()
    const key = JSON.stringify([page, search, sortDirection, reloadKey])

    getCategories({ page, pageSize: PAGE_SIZE, search, sortDirection }, controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return
        // The page emptied out (e.g. its last item was deleted): step back to the new last page.
        if (data.items.length === 0 && data.totalPages > 0 && data.page > data.totalPages) {
          setPageState({ page: data.totalPages, search })
          return
        }
        setResult({ key, data, failed: false })
      },
      () => {
        if (!controller.signal.aborted) setResult((previous) => ({ key, data: previous?.data, failed: true }))
      },
    )

    return () => controller.abort()
  }, [page, search, sortDirection, reloadKey])

  // The last successful page stays on screen while the next one loads, so the table doesn't flash.
  const data = result?.data
  const isFetching = result?.key !== requestKey
  const status: CategoriesStatus = result?.key === requestKey && result.failed ? 'error' : data ? 'ready' : 'loading'

  const setPage = useCallback((nextPage: number) => setPageState({ page: nextPage, search }), [search])

  const toggleSortDirection = useCallback(() => {
    setSortDirection((current) => (current === 'Asc' ? 'Desc' : 'Asc'))
    setPageState({ page: 1, search })
  }, [search])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  const createCategory = useCallback(
    async (values: CategoryFormValues) => {
      await createCategoryRequest(values)
      reload()
    },
    [reload],
  )

  const updateCategory = useCallback(
    async (id: number, values: CategoryFormValues) => {
      await updateCategoryRequest(id, values)
      reload()
    },
    [reload],
  )

  const deleteCategory = useCallback(
    async (id: number) => {
      await deleteCategoryRequest(id)
      reload()
    },
    [reload],
  )

  return {
    data,
    status,
    isFetching,
    searchInput,
    setSearchInput,
    /** The search actually applied to the current results (debounced and trimmed). */
    search,
    sortDirection,
    toggleSortDirection,
    setPage,
    reload,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
