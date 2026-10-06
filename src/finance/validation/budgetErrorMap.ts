import type { ApiErrorFieldMap } from '../../shared/utils/applyApiErrorToForm'
import type { BudgetFormValues } from './budgetSchema'

// Espelha os códigos de LifeManager.Domain/Budgets/Errors/BudgetErrors.cs
export const BUDGET_NOT_FOUND_CODE = 'Budget.NotFound'

export const budgetErrorFieldMap: ApiErrorFieldMap<BudgetFormValues> = {
  'Budget.InvalidType': { field: 'type', message: 'finance:budgets.validation.type.invalid' },
  'Budget.InvalidMonth': { field: 'from', message: 'finance:budgets.validation.from.invalid' },
  'Budget.AmountNotPositive': { field: 'amount', message: 'finance:budgets.validation.amount.notPositive' },
  'Budget.AmountTooManyDecimals': { field: 'amount', message: 'finance:budgets.validation.amount.tooManyDecimals' },
  'Budget.AmountTooLarge': { field: 'amount', message: 'finance:budgets.validation.amount.tooLarge' },
  // The chosen category was deleted (or never belonged to the user) after the options were loaded.
  'Category.NotFound': { field: 'categoryId', message: 'finance:budgets.validation.category.notFound' },
}
