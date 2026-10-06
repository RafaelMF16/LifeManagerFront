import type { SortDirection } from '../../shared/types/Paging'
import type { MoneyFlowType, TransactionTypeFilter } from './TransactionDtos'

// Espelha LifeManager.Domain/RecurringTransactions/Enums (binds by name).
export type RecurringTransactionStatus = 'Active' | 'Paused' | 'Finished'
export type RecurringTransactionStatusFilter = 'All' | RecurringTransactionStatus
export type RecurringTransactionSortBy = 'NextOccurrence' | 'Description' | 'Amount' | 'Day'

// Espelha LifeManager.Application/RecurringTransactions/DTOs
export interface RecurringTransactionRequestDto {
  type: MoneyFlowType
  categoryId: number
  amount: number
  description: string
  /** 1–31; months shorter than that fall on their last day. */
  dayOfMonth: number
  /** `yyyy-MM`, the current month or later. */
  startMonth: string
  /** `yyyy-MM`; null means it never ends. */
  endMonth: string | null
}

export interface RecurringTransactionResponseDto {
  id: number
  type: MoneyFlowType
  categoryId: number
  categoryName: string
  /** Always positive; `type` says whether it comes in, is spent or is invested. */
  amount: number
  description: string
  dayOfMonth: number
  /** `yyyy-MM`. */
  startMonth: string
  /** `yyyy-MM`; null means it never ends. */
  endMonth: string | null
  status: RecurringTransactionStatus
  /** ISO date `YYYY-MM-DD` of the next posting; null once finished. */
  nextOccurrenceDate: string | null
}

// Espelha RecurringTransactionListQueryDto (query string de GET /api/RecurringTransactions)
export interface RecurringTransactionListQuery {
  page: number
  pageSize: number
  type: TransactionTypeFilter
  status: RecurringTransactionStatusFilter
  search?: string
  sortBy: RecurringTransactionSortBy
  sortDirection: SortDirection
}
