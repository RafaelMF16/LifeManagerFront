import { apiRequest } from '../../shared/services/httpClient'
import type { BudgetPlanRequestDto, BudgetPlanResponseDto } from '../types/BudgetPlanDtos'

const BUDGET_PLANS_PATH = '/api/BudgetPlans'

/** The plan of `month` (`yyyy-MM`) against what was actually spent and invested; `exists` is false without one. */
export function getBudgetPlan(month: string, signal?: AbortSignal): Promise<BudgetPlanResponseDto> {
  return apiRequest<BudgetPlanResponseDto>(`${BUDGET_PLANS_PATH}/${month}`, { method: 'GET', signal })
}

/** Creates or replaces the whole plan of `month`; no other month changes. */
export function saveBudgetPlan(month: string, request: BudgetPlanRequestDto): Promise<BudgetPlanResponseDto> {
  return apiRequest<BudgetPlanResponseDto>(`${BUDGET_PLANS_PATH}/${month}`, { method: 'PUT', body: request })
}

export async function deleteBudgetPlan(month: string): Promise<void> {
  await apiRequest<void>(`${BUDGET_PLANS_PATH}/${month}`, { method: 'DELETE' })
}
