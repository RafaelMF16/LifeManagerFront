import { apiDownload, apiRequest } from '../../shared/services/httpClient'
import { fileNameFromContentDisposition, saveBlob } from '../../shared/utils/downloadBlob'
import type { PagedResponse } from '../../shared/types/Paging'
import type {
  QuickTransactionResponseDto,
  TransactionListQuery,
  TransactionRequestDto,
  TransactionResponseDto,
} from '../types/TransactionDtos'
import { exportFallbackFileName, exportPath, parseRowCount } from '../utils/exportQuery'
import { parseAmount } from '../validation/amountSchema'
import type { ExportFormValues } from '../validation/exportSchema'
import type { TransactionFormValues } from '../validation/transactionSchema'

function transactionsPath(monthlySummaryId: number) {
  return `/api/MonthlySummaries/${monthlySummaryId}/Transactions`
}

/** The goal goes only with an investment: another type sends none, whatever the form still holds. */
export function toTransactionRequestDto(values: TransactionFormValues): TransactionRequestDto {
  return {
    type: values.type,
    categoryId: Number(values.categoryId),
    // The schema already rejected anything parseAmount can't read.
    amount: parseAmount(values.amount) ?? 0,
    description: values.description,
    date: values.date,
    savingsGoalId: values.type === 'Investment' && values.savingsGoalId ? Number(values.savingsGoalId) : null,
  }
}

export function getTransactions(
  monthlySummaryId: number,
  query: TransactionListQuery,
  signal?: AbortSignal,
): Promise<PagedResponse<TransactionResponseDto>> {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    type: query.type,
    sortBy: query.sortBy,
    sortDirection: query.sortDirection,
  })
  if (query.categoryId !== null) params.set('categoryId', String(query.categoryId))
  if (query.date) params.set('date', query.date)
  if (query.savingsGoalId !== undefined) params.set('savingsGoalId', String(query.savingsGoalId))
  if (query.search) params.set('search', query.search)

  return apiRequest<PagedResponse<TransactionResponseDto>>(`${transactionsPath(monthlySummaryId)}?${params}`, { method: 'GET', signal })
}

export function createTransaction(monthlySummaryId: number, values: TransactionFormValues): Promise<TransactionResponseDto> {
  return apiRequest<TransactionResponseDto>(transactionsPath(monthlySummaryId), {
    method: 'POST',
    body: toTransactionRequestDto(values),
  })
}

/** Creates a transaction without picking its month: the backend puts it in the month of its date, opening it when missing. */
export function createQuickTransaction(values: TransactionFormValues): Promise<QuickTransactionResponseDto> {
  return apiRequest<QuickTransactionResponseDto>('/api/Transactions', {
    method: 'POST',
    body: toTransactionRequestDto(values),
  })
}

export function updateTransaction(monthlySummaryId: number, id: number, values: TransactionFormValues): Promise<TransactionResponseDto> {
  return apiRequest<TransactionResponseDto>(`${transactionsPath(monthlySummaryId)}/${id}`, {
    method: 'PUT',
    body: toTransactionRequestDto(values),
  })
}

export async function deleteTransaction(monthlySummaryId: number, id: number): Promise<void> {
  await apiRequest<void>(`${transactionsPath(monthlySummaryId)}/${id}`, { method: 'DELETE' })
}

/**
 * Downloads the period's transactions as CSV (`GET /api/Transactions/Export`) and saves it, unless the backend says
 * the period has none (`X-Row-Count: 0`): then nothing is saved. Resolves with the row count (null when unknown).
 */
export async function exportTransactions(values: ExportFormValues, signal?: AbortSignal): Promise<{ rowCount: number | null }> {
  const { blob, contentDisposition, headers } = await apiDownload(exportPath(values), signal)
  const rowCount = parseRowCount(headers.get('X-Row-Count'))

  if (rowCount !== 0) saveBlob(blob, fileNameFromContentDisposition(contentDisposition, exportFallbackFileName(values)))

  return { rowCount }
}
