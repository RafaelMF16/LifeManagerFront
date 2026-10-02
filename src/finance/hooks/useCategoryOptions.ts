import { useEffect, useState } from 'react'
import { PAGE_SIZE_MAX } from '../../shared/types/Paging'
import { getCategories } from '../services/categoryService'
import type { CategoryResponseDto } from '../types/CategoryDtos'

export type CategoryOptionsStatus = 'loading' | 'ready' | 'error'

/**
 * The user's categories for the transaction selects (filter and form), alphabetically.
 * A select needs every option, so this reads one page of the backend's maximum size: users with more
 * categories than that only see the first ones, a known limit until there is a searchable picker.
 */
export function useCategoryOptions() {
  const [categories, setCategories] = useState<CategoryResponseDto[]>([])
  const [status, setStatus] = useState<CategoryOptionsStatus>('loading')

  useEffect(() => {
    const controller = new AbortController()

    getCategories({ page: 1, pageSize: PAGE_SIZE_MAX, sortDirection: 'Asc' }, controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return
        setCategories(data.items)
        setStatus('ready')
      },
      () => {
        if (!controller.signal.aborted) setStatus('error')
      },
    )

    return () => controller.abort()
  }, [])

  return { categories, status }
}
