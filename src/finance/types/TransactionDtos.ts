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
  /** The savings goal this investment counts towards; only an investment takes one. */
  savingsGoalId: number | null
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
  /** The savings goal this investment counts towards; null for none. */
  savingsGoalId: number | null
  /** The goal's name (archived goals too); only on the reads (one transaction, the month's listing). */
  savingsGoalName?: string | null
}

// Espelha QuickTransactionResponseDto (POST /api/Transactions)
export interface QuickTransactionResponseDto extends TransactionResponseDto {
  /** The month the entry went to, which may have just been opened. */
  monthlySummaryId: number
  /** The month was missing and this entry opened it. */
  monthCreated: boolean
}

// Espelha TransactionListQueryDto (query string de GET /api/MonthlySummaries/{id}/Transactions)
export interface TransactionListQuery {
  page: number
  pageSize: number
  type: TransactionTypeFilter
  /** Null means every category. */
  categoryId: number | null
  /** One day of the month, ISO `YYYY-MM-DD`; left out means every day. */
  date?: string
  /** Only the transactions linked to this savings goal. */
  savingsGoalId?: number
  search?: string
  sortBy: TransactionSortBy
  sortDirection: SortDirection
}
