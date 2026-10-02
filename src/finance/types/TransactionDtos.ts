import type { SortDirection } from '../../shared/types/Paging'

// Espelha LifeManager.Domain/Shared/Enums/MoneyFlowType.cs e LifeManager.Domain/Transactions/Enums (binds by name).
export type MoneyFlowType = 'Expense' | 'Income'
export type TransactionTypeFilter = 'All' | 'Expense' | 'Income'
export type TransactionSortBy = 'Date' | 'Description' | 'Category' | 'Amount'

// Espelha LifeManager.Application/Transactions/DTOs
export interface TransactionRequestDto {
  type: MoneyFlowType
  categoryId: number
  amount: number
  description: string
  /** ISO date, `YYYY-MM-DD` (C# `DateOnly`). */
  date: string
}

export interface TransactionResponseDto {
  id: number
  type: MoneyFlowType
  categoryId: number
  categoryName: string
  /** Always positive; `type` says whether it came in or went out. */
  amount: number
  description: string
  /** ISO date, `YYYY-MM-DD`. */
  date: string
}

// Espelha TransactionListQueryDto (query string de GET /api/MonthlySummaries/{id}/Transactions)
export interface TransactionListQuery {
  page: number
  pageSize: number
  type: TransactionTypeFilter
  /** Null means every category. */
  categoryId: number | null
  search?: string
  sortBy: TransactionSortBy
  sortDirection: SortDirection
}
