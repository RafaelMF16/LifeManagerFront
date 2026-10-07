import { apiRequest } from '../../shared/services/httpClient'
import type { BudgetMonthResponseDto, BudgetRequestDto, BudgetResponseDto } from '../types/BudgetDtos'
import { parseAmount } from '../validation/amountSchema'
import type { BudgetFormValues } from '../validation/budgetSchema'

const BUDGETS_PATH = '/api/Budgets'

/** The goals in force in `month` (`yyyy-MM`), each against what was actually spent or invested. */
export function getBudgetMonth(month: string, signal?: AbortSignal): Promise<BudgetMonthResponseDto> {
  const params = new URLSearchParams({ month })

  return apiRequest<BudgetMonthResponseDto>(`${BUDGETS_PATH}?${params}`, { method: 'GET', signal })
}

/** Sets the goal from `values.from` on; earlier months keep the goal they had. */
export function setBudget(values: BudgetFormValues): Promise<BudgetResponseDto> {
  return apiRequest<BudgetResponseDto>(BUDGETS_PATH, {
    method: 'PUT',
    body: {
      type: values.type,
      categoryId: values.categoryId === '' ? null : Number(values.categoryId),
      from: values.from,
      // The schema already rejected anything parseAmount can't read.
      amount: parseAmount(values.amount) ?? 0,
    } satisfies BudgetRequestDto,
  })
}

/** Removes the goal `id` belongs to from `month` (`yyyy-MM`) on; earlier months keep it. */
export async function removeBudget(id: number, month: string): Promise<void> {
  const params = new URLSearchParams({ month })

  await apiRequest<void>(`${BUDGETS_PATH}/${id}?${params}`, { method: 'DELETE' })
}
