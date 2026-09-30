import type { SortDirection } from '../../shared/types/Paging'

// Espelha LifeManager.Application/Categories/DTOs
export interface CategoryRequestDto {
  name: string
}

export interface CategoryResponseDto {
  id: number
  name: string
}

// Espelha CategoryListQueryDto (query string de GET /api/Categories)
export interface CategoryListQuery {
  page: number
  pageSize: number
  search?: string
  sortDirection: SortDirection
}
