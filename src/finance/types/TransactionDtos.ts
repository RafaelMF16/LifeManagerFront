import type { SortDirection } from '../../shared/types/Paging'

// Espelha LifeManager.Domain/Shared/Enums/MoneyFlowType.cs e LifeManager.Domain/Transactions/Enums (binds by name).
export type MoneyFlowType = 'Expense' | 'Income' | 'Investment'
export type TransactionTypeFilter = 'All' | 'Expense' | 'Income' | 'Investment'
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
  /** Always positive; `type` says whether it came in, was spent or was invested. */
  amount: number
  description: string
  /** ISO date, `YYYY-MM-DD`. */
  date: string
  /** The recurrence that posted it; null for transactions entered by hand. */
  recurringTransactionId: number | null
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
