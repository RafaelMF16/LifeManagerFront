// Espelha os códigos de LifeManager.Domain/BudgetPlans/Errors/BudgetPlanErrors.cs que um save pode devolver.

/** Errors on the total, shown under the field. */
export const budgetPlanTotalErrors: Record<string, string> = {
  'BudgetPlan.TotalNotPositive': 'finance:budgetPlan.validation.total.notPositive',
  'BudgetPlan.TotalTooManyDecimals': 'finance:budgetPlan.validation.total.tooManyDecimals',
  'BudgetPlan.TotalTooLarge': 'finance:budgetPlan.validation.total.tooLarge',
}

/** Errors on the slices, shown in an error modal; any other validation code falls back to `errors.invalid`. */
export const budgetPlanSaveErrors: Record<string, string> = {
  'BudgetPlan.OverAllocated': 'finance:budgetPlan.errors.overAllocated',
  // A slice's category was deleted (or never belonged to the user) after the plan was loaded.
  'Category.NotFound': 'finance:budgetPlan.errors.categoryNotFound',
}
