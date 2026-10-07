import { apiRequest } from '../../shared/services/httpClient'
import type { PagedResponse } from '../../shared/types/Paging'
import type {
  RecurringTransactionListQuery,
  RecurringTransactionRequestDto,
  RecurringTransactionResponseDto,
} from '../types/RecurringTransactionDtos'
import { parseAmount } from '../validation/amountSchema'
import type { RecurringTransactionFormValues } from '../validation/recurringTransactionSchema'

const RECURRING_TRANSACTIONS_PATH = '/api/RecurringTransactions'

function toRequestDto(values: RecurringTransactionFormValues): RecurringTransactionRequestDto {
  return {
    type: values.type,
    categoryId: Number(values.categoryId),
    // The schema already rejected anything parseAmount can't read.
    amount: parseAmount(values.amount) ?? 0,
    description: values.description,
    dayOfMonth: Number(values.dayOfMonth),
    startMonth: values.startMonth,
    endMonth: values.endMonth === '' ? null : values.endMonth,
  }
}

export function getRecurringTransactions(
  query: RecurringTransactionListQuery,
  signal?: AbortSignal,
): Promise<PagedResponse<RecurringTransactionResponseDto>> {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    type: query.type,
    status: query.status,
    sortBy: query.sortBy,
    sortDirection: query.sortDirection,
  })
  if (query.search) params.set('search', query.search)

  return apiRequest<PagedResponse<RecurringTransactionResponseDto>>(`${RECURRING_TRANSACTIONS_PATH}?${params}`, {
    method: 'GET',
    signal,
  })
}

/** Saving also posts right away whatever is already due (e.g. this month's occurrence, if its day has passed). */
export function createRecurringTransaction(values: RecurringTransactionFormValues): Promise<RecurringTransactionResponseDto> {
  return apiRequest<RecurringTransactionResponseDto>(RECURRING_TRANSACTIONS_PATH, {
    method: 'POST',
    body: toRequestDto(values),
  })
}

export function updateRecurringTransaction(id: number, values: RecurringTransactionFormValues): Promise<RecurringTransactionResponseDto> {
  return apiRequest<RecurringTransactionResponseDto>(`${RECURRING_TRANSACTIONS_PATH}/${id}`, {
    method: 'PUT',
    body: toRequestDto(values),
  })
}

export function pauseRecurringTransaction(id: number): Promise<RecurringTransactionResponseDto> {
  return apiRequest<RecurringTransactionResponseDto>(`${RECURRING_TRANSACTIONS_PATH}/${id}/Pause`, { method: 'POST' })
}

/** The months it stayed paused are skipped; this month's occurrence posts if its day has passed. */
export function resumeRecurringTransaction(id: number): Promise<RecurringTransactionResponseDto> {
  return apiRequest<RecurringTransactionResponseDto>(`${RECURRING_TRANSACTIONS_PATH}/${id}/Resume`, { method: 'POST' })
}

/** The transactions it already posted are kept. */
export async function deleteRecurringTransaction(id: number): Promise<void> {
  await apiRequest<void>(`${RECURRING_TRANSACTIONS_PATH}/${id}`, { method: 'DELETE' })
}
