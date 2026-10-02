import type { SortDirection } from '../../shared/types/Paging'

// Espelha LifeManager.Domain/MonthlySummaries/Enums (binds by name in the query string).
export type MonthlySummarySortBy = 'Period' | 'TotalIncome' | 'TotalExpense' | 'Balance'
export type BalanceFilter = 'All' | 'Positive' | 'Negative'

// Espelha LifeManager.Application/MonthlySummaries/DTOs
export interface MonthlySummaryRequestDto {
  month: number
}

export interface MonthlySummaryResponseDto {
  id: number
  month: number
  year: number
  totalIncome: number
  totalExpense: number
  balance: number
}

// Espelha MonthlySummaryDetailsResponseDto (GET /api/MonthlySummaries/{id})
export interface MonthlySummaryDetailsDto extends MonthlySummaryResponseDto {
  incomeCount: number
  expenseCount: number
  /** The user's month right before this one; null when there is none. */
  previousId: number | null
  /** The user's month right after this one; null when there is none. */
  nextId: number | null
}

// Espelha MonthlySummaryListQueryDto (query string de GET /api/MonthlySummaries)
export interface MonthlySummaryListQuery {
  page: number
  pageSize: number
  /** Null means every year. */
  year: number | null
  balance: BalanceFilter
  sortBy: MonthlySummarySortBy
  sortDirection: SortDirection
}
