import { z } from 'zod'
import { amountField, parseAmount } from './amountSchema'

// Espelha BudgetTotal.Create (LifeManager.Domain/BudgetPlans).
export const budgetPlanSchema = z.object({
  // codes: BudgetPlan.TotalNotPositive, BudgetPlan.TotalTooManyDecimals, BudgetPlan.TotalTooLarge
  total: amountField('finance:budgetPlan.validation.total'),
})

/** The total typed in the field, or null while it isn't one the backend would take. */
export function readTotal(text: string) {
  return budgetPlanSchema.safeParse({ total: text }).success ? parseAmount(text) : null
}
