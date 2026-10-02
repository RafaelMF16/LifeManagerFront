// Espelha LifeManager.Application/Shared/DTOs/PagedResponseDto.cs — envelope de toda listagem paginada.
export interface PagedResponse<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

// Espelha PageRequest.MaxPageSize (LifeManager.Domain/Shared/Paging/PageRequest.cs).
export const PAGE_SIZE_MAX = 100

// Espelha LifeManager.Domain/Shared/Enums/SortDirection.cs (binds by name in the query string).
export type SortDirection = 'Asc' | 'Desc'
