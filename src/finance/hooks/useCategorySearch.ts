import { useCallback, useEffect, useRef, useState } from 'react'
import { useDebouncedValue } from '../../shared/hooks/useDebouncedValue'
import { getCategories } from '../services/categoryService'
import type { CategoryResponseDto } from '../types/CategoryDtos'

export const CATEGORY_SEARCH_PAGE_SIZE = 20
const SEARCH_DEBOUNCE_MS = 250

export type CategorySearchStatus = 'idle' | 'loading' | 'ready' | 'error'

interface SearchResult {
  /** The search (and reload) this answers; a result for another key is stale. */
  key: string
  categories: CategoryResponseDto[]
  page: number
  totalPages: number
}

/**
 * The user's categories matching `query` (accent and case insensitive, searched by the backend), alphabetically,
 * one page of 20 at a time. Nothing is fetched while `enabled` is false: a picker only searches with its list open,
 * so a screen with a picker per row (the import review) doesn't fire one request per row.
 */
export function useCategorySearch(query: string, enabled: boolean) {
  const search = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS)
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [failedKey, setFailedKey] = useState<string | null>(null)
  const [loadingMoreKey, setLoadingMoreKey] = useState<string | null>(null)
  const moreController = useRef<AbortController | null>(null)
  const key = `${reloadKey}:${search}`

  useEffect(() => {
    if (!enabled) return

    const controller = new AbortController()
    moreController.current?.abort()

    getCategories(
      { page: 1, pageSize: CATEGORY_SEARCH_PAGE_SIZE, search: search || undefined, sortDirection: 'Asc' },
      controller.signal,
    ).then(
      (data) => {
        if (controller.signal.aborted) return
        setResult({ key, categories: data.items, page: 1, totalPages: data.totalPages })
        setFailedKey(null)
      },
      () => {
        if (!controller.signal.aborted) setFailedKey(key)
      },
    )

    return () => controller.abort()
  }, [key, search, enabled])

  // Abort a pending "load more" when the picker goes away.
  useEffect(() => () => moreController.current?.abort(), [])

  const current = result?.key === key ? result : null
  const status: CategorySearchStatus = failedKey === key ? 'error' : current ? 'ready' : enabled ? 'loading' : 'idle'
  const isLoadingMore = loadingMoreKey === key

  const loadMore = useCallback(() => {
    if (!current || isLoadingMore || current.page >= current.totalPages) return

    const controller = new AbortController()
    moreController.current?.abort()
    moreController.current = controller
    setLoadingMoreKey(key)

    getCategories(
      { page: current.page + 1, pageSize: CATEGORY_SEARCH_PAGE_SIZE, search: search || undefined, sortDirection: 'Asc' },
      controller.signal,
    ).then(
      (data) => {
        if (controller.signal.aborted) return
        setResult((previous) =>
          previous?.key === key
            ? { key, categories: [...previous.categories, ...data.items], page: data.page, totalPages: data.totalPages }
            : previous,
        )
        setLoadingMoreKey(null)
      },
      () => {
        if (!controller.signal.aborted) setLoadingMoreKey(null)
      },
    )
  }, [current, isLoadingMore, key, search])

  const retry = useCallback(() => setReloadKey((value) => value + 1), [])

  return {
    categories: current?.categories ?? [],
    status,
    hasMore: current !== null && current.page < current.totalPages,
    isLoadingMore,
    loadMore,
    retry,
    /** Whether the shown results already answer the current text (false while the debounce is pending). */
    isSettled: search === query.trim() && status === 'ready',
  }
}
