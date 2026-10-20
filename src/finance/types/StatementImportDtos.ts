import type { SortDirection } from '../../shared/types/Paging'
import type { MoneyFlowType } from './TransactionDtos'

// Espelha LifeManager.Domain/StatementImports/Enums e Categorization/Enums (binds by name).
export type StatementImportSource = 'Ofx' | 'Csv'
export type StatementImportStatus = 'Draft' | 'Committed'
export type StatementImportRowFilter = 'All' | 'Uncategorized' | 'Suggested' | 'Duplicates' | 'Excluded'
export type StatementImportRowSortBy = 'Date' | 'Description' | 'Category' | 'Amount'
export type SuggestionSource =
  | 'None'
  | 'Rule'
  | 'History'
  | 'Similar'
  | 'InvestmentApplication'
  | 'InvestmentRedemption'
  | 'OwnTransfer'
export type SuggestionConfidence = 'Low' | 'Medium' | 'High'

// Espelha LifeManager.Application/StatementImports/DTOs
export interface StatementLineDto {
  /** `YYYY-MM-DD`. */
  date: string
  description: string
  /** Negative when money left the account. */
  amount: number
  fitid: string | null
}

export interface StatementImportRequestDto {
  fileName: string
  source: StatementImportSource
  /** A hash of the bank account read from the file (OFX), so its lines are recognized when imported again. */
  accountKey: string | null
  lines: StatementLineDto[]
}

export interface StatementImportResponseDto {
  id: number
  fileName: string
  source: StatementImportSource
  status: StatementImportStatus
  rowCount: number
  firstDate: string
  lastDate: string
  createdAt: string
  committedAt: string | null
  importedCount: number | null
  createdMonthCount: number | null
}

export interface StatementImportMonthDto {
  /** `yyyy-MM`. */
  month: string
  /** The user's month when it already exists; null when confirming will open it. */
  monthlySummaryId: number | null
  rowCount: number
  includedCount: number
  uncategorizedCount: number
  suggestedCount: number
  duplicateCount: number
  totalIncome: number
  totalExpense: number
  totalInvestment: number
}

export interface StatementImportDetailsDto extends StatementImportResponseDto {
  includedCount: number
  uncategorizedCount: number
  suggestedCount: number
  duplicateCount: number
  /** Chronological; empty once the import is confirmed. */
  months: StatementImportMonthDto[]
}

export interface StatementImportRowDto {
  id: number
  date: string
  description: string
  /** What the bank wrote. */
  originalDescription: string
  /** Always positive; `type` gives the direction. */
  amount: number
  type: MoneyFlowType
  categoryId: number | null
  categoryName: string | null
  included: boolean
  duplicateOfTransactionId: number | null
  duplicateOfMonthlySummaryId: number | null
  suggestionSource: SuggestionSource
  suggestionConfidence: SuggestionConfidence | null
  suggestionUses: number
  /** The user changed this row directly: no suggestion badge, and "apply to similar" leaves it alone. */
  editedByUser: boolean
}

export interface StatementImportRowRequestDto {
  type: MoneyFlowType
  categoryId: number | null
  amount: number
  description: string
  date: string
  included: boolean
}

export interface StatementImportRowUpdateResultDto {
  row: StatementImportRowDto
  /** Rows of the same merchant, not edited directly, filed differently: what "apply to similar" would change. */
  similarCount: number
}

export interface StatementImportBulkUpdateDto {
  rowIds: number[]
  type: MoneyFlowType | null
  categoryId: number | null
  included: boolean | null
}

export interface StatementImportRowsChangedDto {
  updatedCount: number
}

export interface StatementImportCommitResultDto {
  importedCount: number
  /** Lines found already posted when confirming. */
  skippedCount: number
  createdMonthCount: number
  months: { monthlySummaryId: number; month: string; created: boolean }[]
}

// Espelha StatementImportRowListQueryDto (query string de GET /api/StatementImports/{id}/Rows)
export interface StatementImportRowListQuery {
  page: number
  pageSize: number
  /** `yyyy-MM`; null means every month. */
  month: string | null
  filter: StatementImportRowFilter
  search?: string
  sortBy: StatementImportRowSortBy
  sortDirection: SortDirection
}
