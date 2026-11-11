import { apiRequest } from '../../shared/services/httpClient'
import type { PagedResponse } from '../../shared/types/Paging'
import type {
  SavingsGoalListQuery,
  SavingsGoalRequestDto,
  SavingsGoalResponseDto,
  SavingsGoalTransactionDto,
} from '../types/SavingsGoalDtos'
import { parseAmount } from '../validation/amountSchema'
import type { SavingsGoalFormValues } from '../validation/savingsGoalSchema'

const SAVINGS_GOALS_PATH = '/api/SavingsGoals'

export function toSavingsGoalRequestDto(values: SavingsGoalFormValues): SavingsGoalRequestDto {
  return {
    name: values.name,
    // The schema already rejected anything parseAmount can't read; an empty initial amount is zero.
    targetAmount: parseAmount(values.targetAmount) ?? 0,
    targetMonth: values.targetMonth === '' ? null : values.targetMonth,
    initialAmount: values.initialAmount === '' ? 0 : (parseAmount(values.initialAmount) ?? 0),
    icon: values.icon,
  }
}

export function getSavingsGoals(query: SavingsGoalListQuery, signal?: AbortSignal): Promise<PagedResponse<SavingsGoalResponseDto>> {
  const params = new URLSearchParams({
    page: String(query.page),
    pageSize: String(query.pageSize),
    status: query.status,
    sortBy: query.sortBy,
    sortDirection: query.sortDirection,
  })
  if (query.search) params.set('search', query.search)

  return apiRequest<PagedResponse<SavingsGoalResponseDto>>(`${SAVINGS_GOALS_PATH}?${params}`, { method: 'GET', signal })
}

/** One goal with its last 12 months (`monthly`). */
export function getSavingsGoal(id: number, signal?: AbortSignal): Promise<SavingsGoalResponseDto> {
  return apiRequest<SavingsGoalResponseDto>(`${SAVINGS_GOALS_PATH}/${id}`, { method: 'GET', signal })
}

/** The goal's linked transactions across months, newest first. */
export function getSavingsGoalTransactions(
  id: number,
  page: number,
  pageSize: number,
  signal?: AbortSignal,
): Promise<PagedResponse<SavingsGoalTransactionDto>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  return apiRequest<PagedResponse<SavingsGoalTransactionDto>>(`${SAVINGS_GOALS_PATH}/${id}/Transactions?${params}`, {
    method: 'GET',
    signal,
  })
}

export function createSavingsGoal(values: SavingsGoalFormValues): Promise<SavingsGoalResponseDto> {
  return apiRequest<SavingsGoalResponseDto>(SAVINGS_GOALS_PATH, { method: 'POST', body: toSavingsGoalRequestDto(values) })
}

export function updateSavingsGoal(id: number, values: SavingsGoalFormValues): Promise<SavingsGoalResponseDto> {
  return apiRequest<SavingsGoalResponseDto>(`${SAVINGS_GOALS_PATH}/${id}`, { method: 'PUT', body: toSavingsGoalRequestDto(values) })
}

/** Archives the goal: its history and linked transactions are kept. */
export async function archiveSavingsGoal(id: number): Promise<void> {
  await apiRequest<void>(`${SAVINGS_GOALS_PATH}/${id}`, { method: 'DELETE' })
}

export function restoreSavingsGoal(id: number): Promise<SavingsGoalResponseDto> {
  return apiRequest<SavingsGoalResponseDto>(`${SAVINGS_GOALS_PATH}/${id}/Restore`, { method: 'POST' })
}
