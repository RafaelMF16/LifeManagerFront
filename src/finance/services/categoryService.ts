import { apiRequest } from '../../shared/services/httpClient'
import type { PagedResponse } from '../../shared/types/Paging'
import type { CategoryListQuery, CategoryRequestDto, CategoryResponseDto } from '../types/CategoryDtos'
import type { CategoryFormValues } from '../validation/categorySchema'

const CATEGORIES_PATH = '/api/Categories'

export function getCategories(query: CategoryListQuery, signal?: AbortSignal): Promise<PagedResponse<CategoryResponseDto>> {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    sortDirection: query.sortDirection,
  })
  if (query.search) params.set('search', query.search)

  return apiRequest<PagedResponse<CategoryResponseDto>>(`${CATEGORIES_PATH}?${params}`, { method: 'GET', signal })
}

export function createCategory(data: CategoryFormValues): Promise<CategoryResponseDto> {
  return apiRequest<CategoryResponseDto>(CATEGORIES_PATH, {
    method: 'POST',
    body: { name: data.name } satisfies CategoryRequestDto,
  })
}

export function updateCategory(id: number, data: CategoryFormValues): Promise<CategoryResponseDto> {
  return apiRequest<CategoryResponseDto>(`${CATEGORIES_PATH}/${id}`, {
    method: 'PUT',
    body: { name: data.name } satisfies CategoryRequestDto,
  })
}

export async function deleteCategory(id: number): Promise<void> {
  await apiRequest<void>(`${CATEGORIES_PATH}/${id}`, { method: 'DELETE' })
}
