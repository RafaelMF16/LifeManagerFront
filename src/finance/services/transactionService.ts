import { apiRequest } from '../../shared/services/httpClient'
import type { PagedResponse } from '../../shared/types/Paging'
import type {
  QuickTransactionResponseDto,
  TransactionListQuery,
  TransactionRequestDto,
  TransactionResponseDto,
} from '../types/TransactionDtos'
import { parseAmount } from '../validation/amountSchema'
import type { TransactionFormValues } from '../validation/transactionSchema'

function transactionsPath(monthlySummaryId: number) {
  return `/api/MonthlySummaries/${monthlySummaryId}/Transactions`
}

function toRequestDto(values: TransactionFormValues): TransactionRequestDto {
  return {
    type: values.type,
    categoryId: Number(values.categoryId),
    // The schema already rejected anything parseAmount can't read.
    amount: parseAmount(values.amount) ?? 0,
    description: values.description,
    date: values.date,
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
  if (query.search) params.set('search', query.search)

  return apiRequest<PagedResponse<TransactionResponseDto>>(`${transactionsPath(monthlySummaryId)}?${params}`, { method: 'GET', signal })
}

export function createTransaction(monthlySummaryId: number, values: TransactionFormValues): Promise<TransactionResponseDto> {
  return apiRequest<TransactionResponseDto>(transactionsPath(monthlySummaryId), {
    method: 'POST',
    body: toRequestDto(values),
  })
}

/** Creates a transaction without picking its month: the backend puts it in the month of its date, opening it when missing. */
export function createQuickTransaction(values: TransactionFormValues): Promise<QuickTransactionResponseDto> {
  return apiRequest<QuickTransactionResponseDto>('/api/Transactions', {
    method: 'POST',
    body: toRequestDto(values),
  })
}

export function updateTransaction(monthlySummaryId: number, id: number, values: TransactionFormValues): Promise<TransactionResponseDto> {
  return apiRequest<TransactionResponseDto>(`${transactionsPath(monthlySummaryId)}/${id}`, {
    method: 'PUT',
    body: toRequestDto(values),
  })
}

export async function deleteTransaction(monthlySummaryId: number, id: number): Promise<void> {
  await apiRequest<void>(`${transactionsPath(monthlySummaryId)}/${id}`, { method: 'DELETE' })
}
